import {
  Delete,
  KeysAndAttributes,
  Put,
  Update,
} from "@aws-sdk/client-dynamodb";
import {
  BatchGetCommand,
  BatchGetCommandInput,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { JSONValue, PatchOperation } from "replicache";
import { JSONObject } from "replicache";
import { dynamoClient } from "~/clients/dynamodb";
import { env } from "~/env.mjs";
import {
  ClientViewRecord,
  Content,
  LastMutationId,
  MergedWorkType,
  Post,
  Quest,
  Solution,
  SpaceVersion,
} from "~/types/types";
import { YJSKey } from "./mutators";
import { rocksetClient } from "~/clients/rockset";
import { ulid } from "ulid";
import { WORKSPACE } from "~/utils/constants";
export const makeCVR = ({
  items,
}: {
  items: { SK: string; version: number }[];
}) => {
  const cvr: ClientViewRecord = {
    id: ulid(),
    keys: {},
  };
  for (const i of items) {
    cvr.keys[i.SK] = i.version;
  }
  return cvr;
};
export const getPatch = async ({
  spaceId,
  prevCVR,
  userId,
}: {
  spaceId: string;
  prevCVR: ClientViewRecord | undefined;
  userId: string;
}) => {
  if (!prevCVR) {
    return await getResetPatch({ spaceId, userId });
  }
  const items = spaceId.startsWith(WORKSPACE)
    ? await getWorkspaceCVR({ spaceId, userId })
    : [];
  try {
    const nextCVR = makeCVR({
      items,
    });

    const putKeys: { PK: string; SK: string }[] = [];
    const delKeys = [];
    for (const { PK, SK, version } of items) {
      const prevVersion = prevCVR.keys[SK];
      if (prevVersion === undefined || prevVersion < version) {
        putKeys.push({ PK, SK });
      }
    }

    for (const key of Object.keys(prevCVR.keys)) {
      if (nextCVR.keys[key] === undefined) {
        delKeys.push(key);
      }
    }
    const fullItems = await getFullItems({
      keys: putKeys,
    });
    // console.log("prev CVR ", JSON.stringify(prevCVR));
    // console.log("new CVR", JSON.stringify(nextCVR));
    // console.log("put keys", JSON.stringify(fullItems));
    // console.log("full items from dynamodb", JSON.stringify(fullItems));
    const patch: PatchOperation[] = [];
    for (const key of delKeys) {
      patch.push({
        op: "del",
        key,
      });
    }
    for (const i of fullItems) {
      const item = i as { SK: string };
      patch.push({
        op: "put",
        key: item.SK,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        value: item,
      });
    }

    return { patch, cvr: nextCVR };
  } catch (error) {
    console.log(error);
    throw new Error("failed to get changed entries");
  }
};
const getVersionsFromDynamoDb = async ({
  keys,
}: {
  keys: { PK: string; SK: string }[];
}) => {
  const tableName = env.MAIN_TABLE_NAME;

  // Divide keys into chunks of 100 (BatchGetCommand limit)
  const chunkSize = 100;
  const promises = []; // Array to hold all promises

  for (let i = 0; i < keys.length; i += chunkSize) {
    const keysChunk = keys.slice(i, i + chunkSize); // Get chunk of keys
    const Keys: Record<string, any>[] = [];

    for (const { PK, SK } of keysChunk) {
      Keys.push({ PK, SK });
    }

    const RequestItems: Record<
      string,
      Omit<KeysAndAttributes, "Keys"> & {
        Keys: Record<string, any>[] | undefined;
      }
    > = {};

    RequestItems[tableName] = {
      Keys,
      ProjectionExpression: "PK, SK, version",
    };

    const params: BatchGetCommandInput = {
      RequestItems,
    };

    promises.push(dynamoClient.send(new BatchGetCommand(params)));
  }

  // Wait for all promises to resolve
  const responses = await Promise.all(promises);

  const allResults: Record<string, any>[] = []; // Array to accumulate all results

  for (const response of responses) {
    if (response.Responses) {
      const result = response.Responses[tableName];
      if (result) {
        allResults.push(...result); // Add the results of this call to the allResults array
      }
    }
  }

  return allResults; // Return all results
};
const getWorkspaceCVR = async ({
  spaceId,
  userId,
}: {
  spaceId: string;
  userId: string;
}) => {
  try {
    const params: QueryCommandInput = {
      TableName: env.MAIN_TABLE_NAME,
      IndexName: env.CVR_INDEX_NAME,
      KeyConditionExpression: "PK = :PK",
      ExpressionAttributeValues: { ":PK": spaceId },
    };
    const workspaceCVRPromise = dynamoClient.send(new QueryCommand(params));

    const collaborativeItemsPromise =
      rocksetClient.queryLambdas.executeQueryLambda(
        "commons",
        "WorkspaceCollaborativeItems",
        "a23c60f39f648c6e",
        {
          parameters: [
            {
              name: "userId",
              type: "string",
              value: userId,
            },
          ],
        }
      );
    const [workspaceCVR, collaborativeItems] = await Promise.all([
      workspaceCVRPromise,
      collaborativeItemsPromise,
    ]);

    if (workspaceCVR.Items && workspaceCVR.Items.length > 0) {
      if (collaborativeItems.results && collaborativeItems.results.length > 0) {
        //versions in dynamo are fresh, while rockset syncs from dynamo with a delay, so always retrieve versions from dynamodb
        const collaborativeCVR = await getVersionsFromDynamoDb({
          keys: collaborativeItems.results as { PK: string; SK: string }[],
        });

        return [...workspaceCVR.Items, ...collaborativeCVR] as {
          PK: string;
          SK: string;
          version: number;
        }[];
      }
      return workspaceCVR.Items as {
        PK: string;
        SK: string;
        version: number;
      }[];
    }
    return [];
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get workspace CVR");
  }
};
const getCVR = async ({ spaceId }: { spaceId: string }) => {
  try {
    const params: QueryCommandInput = {
      TableName: env.MAIN_TABLE_NAME,
      IndexName: env.CVR_INDEX_NAME,
      KeyConditionExpression: "PK = :PK",
      ExpressionAttributeValues: { ":PK": spaceId },
    };
    const result = await dynamoClient.send(new QueryCommand(params));
    if (result.Items && result.Items.length > 0) {
      return result.Items as { SK: string; version: number }[];
    }

    return [];
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get space items");
  }
};
const getResetPatch = async ({
  spaceId,
  userId,
}: {
  spaceId: string;
  userId: string;
}) => {
  const items = spaceId.startsWith(WORKSPACE)
    ? await getWorkspaceItems({ spaceId, userId })
    : [];
  const cvr = makeCVR({ items });
  const patch: PatchOperation[] = [
    {
      op: "clear",
    },
  ];

  for (const item of items) {
    patch.push({
      op: "put",
      key: item.SK,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      value: item,
    });
  }

  return {
    patch,
    cvr,
  };
};

const recursiveQuery = async (params: QueryCommandInput) => {
  let items: Record<string, any>[] = [];
  let lastEvaluatedKey;

  do {
    const data = await dynamoClient.send(new QueryCommand(params));
    if (data.Items && data.Items.length > 0) {
      items = [...items, ...data.Items];
      lastEvaluatedKey = data.LastEvaluatedKey;
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
  } while (lastEvaluatedKey);

  return items;
};
const getWorkspaceItems = async ({
  spaceId,
  userId,
}: {
  spaceId: string;
  userId: string;
}) => {
  try {
    const params: QueryCommandInput = {
      TableName: env.MAIN_TABLE_NAME,
      KeyConditionExpression: "PK = :PK",
      ExpressionAttributeValues: { ":PK": spaceId },
    };
    const workspaceItemsPromise = recursiveQuery(params);

    const collaborativeItemsIdsPromise =
      rocksetClient.queryLambdas.executeQueryLambda(
        "commons",
        "WorkspaceCollaborativeItems",
        "06c57497728b7d5f",
        {
          parameters: [
            {
              name: "userId",
              type: "string",
              value: userId,
            },
          ],
        }
      );
    const [workspaceItems, collaborativeItemsIds] = await Promise.all([
      workspaceItemsPromise,
      collaborativeItemsIdsPromise,
    ]);
    if (workspaceItems && workspaceItems.length > 0) {
      if (
        collaborativeItemsIds.results &&
        collaborativeItemsIds.results.length > 0
      ) {
        const keys: { PK: string; SK: string }[] = [];
        for (const { PK, SK } of collaborativeItemsIds.results as {
          PK: string;
          SK: string;
        }[]) {
          keys.push({ PK, SK });
        }
        const collborativeItems = await getFullItems({ keys });
        return [...workspaceItems, ...collborativeItems] as (MergedWorkType & {
          SK: string;
        })[];
      }
      return workspaceItems as (MergedWorkType & { SK: string })[];
    }
    return [];
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get workspace items");
  }
};

export const getFullItems = async ({
  keys,
}: {
  keys: { PK: string; SK: string }[];
}) => {
  try {
    const tableName = env.MAIN_TABLE_NAME;

    // Divide keys into chunks of 100 (BatchGetCommand limit)
    const chunkSize = 100;
    const promises = []; // Array to hold all promises

    for (let i = 0; i < keys.length; i += chunkSize) {
      const keysChunk = keys.slice(i, i + chunkSize); // Get chunk of keys
      const Keys: Record<string, any>[] = [];

      for (const { PK, SK } of keysChunk) {
        Keys.push({ PK, SK });
      }

      const RequestItems: Record<
        string,
        Omit<KeysAndAttributes, "Keys"> & {
          Keys: Record<string, any>[] | undefined;
        }
      > = {};

      RequestItems[tableName] = {
        Keys,
      };

      const params: BatchGetCommandInput = {
        RequestItems,
      };

      promises.push(dynamoClient.send(new BatchGetCommand(params)));
    }

    // Wait for all promises to resolve
    const responses = await Promise.all(promises);

    const allResults: Record<string, any>[] = []; // Array to accumulate all results

    for (const response of responses) {
      if (response.Responses) {
        const result = response.Responses[tableName];
        if (result) {
          allResults.push(...result); // Add the results of this call to the allResults array
        }
      }
    }

    return allResults; // Return all results
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get workspace items");
  }
};

export const getItem = async ({
  spaceId,
  key,
}: {
  spaceId: string;
  key: string;
}) => {
  const getParams: GetCommandInput = {
    Key: {
      PK: spaceId,
      SK: key,
    },
    TableName: env.MAIN_TABLE_NAME,
  };
  try {
    const result = await dynamoClient.send(new GetCommand(getParams));
    if (result.Item) {
      return result.Item;
    }
    return undefined;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get item");
  }
};
export const putItems = async ({
  spaceId,
  items,
}: {
  spaceId: string;
  items: { key: string; value: JSONObject }[];
}) => {
  if (items.length === 0) {
    return;
  }

  const putItems: {
    Put:
      | (Omit<Put, "ExpressionAttributeValues" | "Item"> & {
          Item: Record<string, any> | undefined;
          ExpressionAttributeValues?: Record<string, any> | undefined;
        })
      | undefined;
  }[] = [];
  for (const item of items) {
    putItems.push({
      Put: {
        TableName: env.MAIN_TABLE_NAME,
        Item: {
          ...item.value,
          PK: spaceId,

          SK: item.key,
        },
      },
    });
  }
  console.log("put items from dynamodb", JSON.stringify(putItems));
  const transactPutParams: TransactWriteCommandInput = {
    TransactItems: putItems,
  };
  try {
    await dynamoClient.send(new TransactWriteCommand(transactPutParams));
  } catch (error) {
    console.log(error);
    throw new Error("Transact put failed");
  }
};
export const updateItems = async ({
  spaceId,
  items,
}: {
  spaceId: string;
  items: { key: string; value: JSONObject }[];
}) => {
  if (items.length === 0) {
    return;
  }

  const updateItems: {
    Update: Omit<Update, "Key" | "ExpressionAttributeValues"> & {
      Key: Record<string, any> | undefined;
      ExpressionAttributeValues?: Record<string, any> | undefined;
    };
  }[] = [];
  for (const { key, value } of items) {
    const attributes = Object.keys(value).map((attribute) => {
      return `${attribute} = :${attribute}`;
    });
    const UpdateExpression = `set ${attributes.join(
      ", "
    )}, #version = #version + :inc`;
    const ExpressionAttributeValues: Record<string, JSONValue | undefined> = {};
    Object.entries(value).forEach(([attr, val]) => {
      ExpressionAttributeValues[`:${attr}`] = val;
    });

    updateItems.push({
      Update: {
        TableName: env.MAIN_TABLE_NAME,
        Key: {
          PK: spaceId,
          SK: key,
        },

        ConditionExpression: "#published = :published",

        ExpressionAttributeNames: {
          "#published": "published",
          "#version": "version",
        },
        UpdateExpression,
        ExpressionAttributeValues: {
          ":published": false,
          ":inc": 1,
          ...ExpressionAttributeValues,
        },
      },
    });
  }
  console.log("update items from dynamodb", JSON.stringify(updateItems));
  const transactPutParams: TransactWriteCommandInput = {
    TransactItems: updateItems,
  };
  try {
    await dynamoClient.send(new TransactWriteCommand(transactPutParams));
  } catch (error) {
    console.log(error);
    throw new Error("Transact update failed");
  }
};
export const delItems = async ({
  spaceId,
  keysToDel,
  userId,
}: {
  spaceId: string;
  keysToDel: string[];
  userId: string;
}) => {
  if (keysToDel.length === 0) {
    return;
  }

  console.log("putting items in trash");
  const updateItems: {
    Update:
      | (Omit<Update, "Key" | "ExpressionAttributeValues"> & {
          Key: Record<string, any> | undefined;
          ExpressionAttributeValues?: Record<string, any> | undefined;
        })
      | undefined;
  }[] = [];
  for (const key of keysToDel) {
    updateItems.push({
      Update: {
        Key: {
          PK: spaceId,

          SK: key,
        },
        UpdateExpression: "SET #inTrash = :value, #version = #version + :inc",
        ConditionExpression: "inTrash <> :value",
        ExpressionAttributeNames: {
          "#inTrash": "inTrash",
          "#version": "version",
        },
        ExpressionAttributeValues: { ":value": true, ":inc": 1 },
        TableName: env.MAIN_TABLE_NAME,
      },
    });
  }
  const transactUpdateParams: TransactWriteCommandInput = {
    TransactItems: updateItems,
  };
  try {
    await dynamoClient.send(new TransactWriteCommand(transactUpdateParams));
  } catch (error) {
    console.log(error);
    throw new Error("Transact delete items failed");
  }
};

export const restoreItems = async ({
  spaceId,
  keysToDel,
}: {
  spaceId: string;

  keysToDel: string[];
}) => {
  if (keysToDel.length === 0) {
    return;
  }

  console.log("putting items in trash");
  const updateItems: {
    Update:
      | (Omit<Update, "Key" | "ExpressionAttributeValues"> & {
          Key: Record<string, any> | undefined;
          ExpressionAttributeValues?: Record<string, any> | undefined;
        })
      | undefined;
  }[] = [];
  for (const key of keysToDel) {
    updateItems.push({
      Update: {
        Key: {
          PK: spaceId,

          SK: key,
        },
        UpdateExpression: "SET #inTrash = :value, #version = #version + :inc",
        ConditionExpression: "inTrash <> :value",
        ExpressionAttributeNames: {
          "#inTrash": "inTrash",
          "#version": "version",
        },
        ExpressionAttributeValues: { ":value": false, ":inc": 1 },
        TableName: env.MAIN_TABLE_NAME,
      },
    });
  }
  const transactUpdateParams: TransactWriteCommandInput = {
    TransactItems: updateItems,
  };
  try {
    await dynamoClient.send(new TransactWriteCommand(transactUpdateParams));
  } catch (error) {
    console.log(error);
    throw new Error("Transact restore items failed");
  }
};
export const delPermItems = async ({
  spaceId,
  keysToDel,
  userId,
}: {
  spaceId: string;
  keysToDel: string[];
  userId: string;
}) => {
  if (keysToDel.length === 0) {
    return;
  }
  const updateItems: {
    Update:
      | (Omit<Update, "Key" | "ExpressionAttributeValues"> & {
          Key: Record<string, any> | undefined;
          ExpressionAttributeValues?: Record<string, any> | undefined;
        })
      | undefined;
  }[] = [];

  const oneDayInSeconds = 24 * 60 * 60;
  const expirationTime = Math.floor(Date.now() / 1000) + oneDayInSeconds;
  for (const key of keysToDel) {
    updateItems.push({
      Update: {
        Key: {
          PK: spaceId,

          SK: key,
        },
        UpdateExpression: "SET #ttl = :ttl, deleted = :deleted",
        ExpressionAttributeNames: {
          "#version": "version",
          "#ttl": "ttl",
        },
        ExpressionAttributeValues: { ":ttl": expirationTime, ":deleted": true },
        TableName: env.MAIN_TABLE_NAME,
      },
    });
    if (key.startsWith("EDITOR")) {
      updateItems.push({
        Update: {
          Key: {
            PK: spaceId,

            SK: `${YJSKey(key.substring(7))}`,
          },
          UpdateExpression: "SET #ttl = :ttl, deleted = :deleted",
          ExpressionAttributeNames: {
            "#version": "version",
            "#ttl": "ttl",
          },
          ExpressionAttributeValues: {
            ":ttl": expirationTime,
            ":deleted": true,
          },
          TableName: env.MAIN_TABLE_NAME,
        },
      });
    }
  }
  const transactUpdateParams: TransactWriteCommandInput = {
    TransactItems: updateItems,
  };
  try {
    await dynamoClient.send(new TransactWriteCommand(transactUpdateParams));
  } catch (error) {
    console.log(error);
    throw new Error("Transact delete items failed");
  }
};
export const getLastMutationIds = async ({
  clientIDs,
  clientGroupID,
}: {
  clientIDs: string[];
  clientGroupID: string;
}) => {
  const tableName = env.EPHEMERAL_TABLE_NAME;
  const RequestItems: Record<
    string,
    Omit<KeysAndAttributes, "Keys"> & {
      Keys: Record<string, any>[] | undefined;
    }
  > = {};
  const Keys = clientIDs.map((id) => ({
    PK: `CLIENT_GROUP#${clientGroupID}`,
    SK: id,
  }));

  RequestItems[tableName] = {
    Keys,
  };
  const batchParams: BatchGetCommandInput = {
    RequestItems,
  };
  try {
    const result = await dynamoClient.send(new BatchGetCommand(batchParams));
    if (result.Responses) {
      const responses = result.Responses[tableName] as LastMutationId[];
      return Object.fromEntries(
        responses.map((val) => {
          return [val.SK, val.lastMutationId ?? 0] as const;
        })
      );
    }
    return {};
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get last mutation Ids for each client");
  }
};
export const getLastMutationIdsSince = async ({
  clientGroupId,
  prevLastMutationIdsCVR,
}: {
  clientGroupId: string;
  prevLastMutationIdsCVR: ClientViewRecord | undefined;
}) => {
  const queryParams: QueryCommandInput = {
    TableName: env.EPHEMERAL_TABLE_NAME,
    KeyConditionExpression: "#PK = :PK",

    ExpressionAttributeNames: {
      "#PK": "PK",
    },
    ExpressionAttributeValues: {
      ":PK": `CLIENT_GROUP#${clientGroupId}`,
    },
  };
  try {
    const result = await dynamoClient.send(new QueryCommand(queryParams));
    if (result.Items) {
      const items = result.Items as LastMutationId[];
      // const items =Object.fromEntries(
      //   lastMutationIDArray.map((l) => [l.id, l.lastMutationId] as const)
      // );
      const nextCVR = makeCVR({ items });
      if (!prevLastMutationIdsCVR) {
        return {
          nextLastMutationIdsCVR: nextCVR,
          lastMutationIDChanges: Object.fromEntries(
            items.map((l) => [l.SK, l.lastMutationId] as const)
          ),
        };
      }
      const lastMutationIDChanges: {
        [k: string]: number;
      } = {};
      for (const { SK, lastMutationId, version } of items) {
        const prevVersion = prevLastMutationIdsCVR.keys[SK];
        if (prevVersion && prevVersion < version) {
          lastMutationIDChanges[SK] = lastMutationId;
        }
      }

      return {
        nextLastMutationIdsCVR: nextCVR,
        lastMutationIDChanges,
      };
    }
    return { nextLastMutationIdsCVR: null, lastMutationIDChanges: {} };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get client IDS");
  }
};
export const setLastMutationIds = async ({
  clientGroupId,
  lmids,
}: {
  clientGroupId: string;
  lmids: Record<string, number>;
}) => {
  console.log("last mutation ids dynamo setLastMutationIds", lmids);

  const oneDayInSeconds = 24 * 60 * 60;
  const expirationTime = Math.floor(Date.now() / 1000) + oneDayInSeconds;
  const updateItems = [...Object.entries(lmids)].map(
    ([clientId, lastMutationId]) => {
      const updateItem: {
        Update:
          | Omit<Update, "Key" | "ExpressionAttributeValues"> & {
              Key: Record<string, any> | undefined;
              ExpressionAttributeValues?: Record<string, any> | undefined;
            };
      } = {
        Update: {
          TableName: env.EPHEMERAL_TABLE_NAME,

          Key: {
            PK: `CLIENT_GROUP#${clientGroupId}`,
            SK: clientId,
          },
          UpdateExpression:
            "SET #id = :id, #lastMutationId = :lastMutationId, #ttl = :ttl, #version = if_not_exists(#version, :zero) + :inc",
          ExpressionAttributeNames: {
            "#id": "id",
            "#lastMutationId": "lastMutationId",
            "#ttl": "ttl",
            "#version": "version",
          },
          ExpressionAttributeValues: {
            ":id": clientId,
            ":lastMutationId": lastMutationId,
            ":ttl": expirationTime,
            ":inc": 1,
            ":zero": 0,
          },
        },
      };
      return updateItem;
    }
  );
  const transactPutParams: TransactWriteCommandInput = {
    TransactItems: updateItems,
  };
  try {
    await dynamoClient.send(new TransactWriteCommand(transactPutParams));
  } catch (error) {
    console.log(error);
    throw new Error("Transact update lastMutationIds failed");
  }
};
export const getPrevCVR = async ({
  spaceId,
  key,
}: {
  spaceId: string;
  key: string | undefined;
}) => {
  if (!key) {
    return undefined;
  }
  const getParams: GetCommandInput = {
    Key: {
      PK: spaceId,
      SK: key,
    },
    TableName: env.EPHEMERAL_TABLE_NAME,
  };
  try {
    const result = await dynamoClient.send(new GetCommand(getParams));
    if (result.Item) {
      return result.Item as ClientViewRecord;
    }
    return undefined;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get item");
  }
};
export const setCVR = async ({
  key,
  spaceId,
  CVR,
}: {
  spaceId: string;
  key: string;
  CVR: ClientViewRecord;
}) => {
  const oneDayInSeconds = 24 * 60 * 60;
  const expirationTime = Math.floor(Date.now() / 1000) + oneDayInSeconds;
  const putParams: PutCommandInput = {
    TableName: env.EPHEMERAL_TABLE_NAME,
    Item: {
      PK: spaceId,
      SK: key,
      ...CVR,
      ttl: expirationTime,
    },
  };
  try {
    await dynamoClient.send(new PutCommand(putParams));
  } catch (error) {
    console.log(error);
    throw new Error("failed to set CVR");
  }
};

export const getLastMutationIdsCVR = async ({
  spaceId,
  key,
}: {
  spaceId: string;
  key: string | undefined;
}) => {
  if (!key) {
    return undefined;
  }
  const getParams: GetCommandInput = {
    Key: {
      PK: spaceId,
      SK: key,
    },
    TableName: env.EPHEMERAL_TABLE_NAME,
  };
  try {
    const result = await dynamoClient.send(new GetCommand(getParams));
    if (result.Item) {
      return result.Item as ClientViewRecord;
    }
    return undefined;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get item");
  }
};
export const setLastMutationIdsCVR = async ({
  spaceId,
  key,
  CVR,
}: {
  spaceId: string;
  key: string;
  CVR: ClientViewRecord;
}) => {
  if (!key) {
    return undefined;
  }
  const oneDayInSeconds = 24 * 60 * 60;
  const expirationTime = Math.floor(Date.now() / 1000) + oneDayInSeconds;
  const putParams: PutCommandInput = {
    TableName: env.EPHEMERAL_TABLE_NAME,
    Item: {
      PK: spaceId,
      SK: key,
      ...CVR,
      ttl: expirationTime,
    },
  };
  try {
    await dynamoClient.send(new PutCommand(putParams));
  } catch (error) {
    console.log(error);
    throw new Error("failed to set LastmutationsId CVR");
  }
};
