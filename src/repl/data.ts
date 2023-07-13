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
  ScanCommand,
  ScanCommandInput,
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
  MergedWork,
  Post,
  PublishedQuest,
  Quest,
  Solution,
  SpaceVersion,
} from "~/types/types";
import { rocksetClient } from "~/clients/rockset";
import {
  LEADERBOARD,
  PUBLISHED_QUESTS,
  USER,
  WORKSPACE,
} from "~/utils/constants";
import { CacheGet, CacheSet } from "@gomomento/sdk";
import { momento } from "~/clients/momento";
import { nanoid } from "nanoid";
import { ulid } from "ulid";
import { contentKey } from "./client/mutators/workspace";
type Page = number | "ALL_SYNCED";
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
  page = 0,
}: {
  spaceId: string;
  prevCVR: ClientViewRecord | undefined;
  userId: string | null;
  page: Page;
}) => {
  if (!prevCVR) {
    return await getResetPatch({ spaceId, userId, page });
  }
  const cvr =
    spaceId.startsWith(WORKSPACE) && userId
      ? await getWorkspaceCVR({ spaceId, userId })
      : spaceId === PUBLISHED_QUESTS
      ? await getPublishedQuestsCVR()
      : spaceId.startsWith(USER)
      ? await getUserCVR({ spaceId })
      : spaceId === LEADERBOARD
      ? await getLeaderboardCVR()
      : [];
  try {
    const nextCVR = makeCVR({
      items: cvr,
    });

    const putKeys: { PK: string; SK: string }[] = [];
    const delKeys = [];
    for (const { PK, SK, version } of cvr) {
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
    const { items: fullItems, page: nextPage } = await getFullItems({
      keys: putKeys,
      page,
      ...(spaceId === LEADERBOARD && {
        ProjectionExpression:
          "id, SK, username, #level, profile, rewarded, questsSolved",
      }),
    });

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

    return { patch, cvr: nextCVR, page: nextPage };
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
const getUserCVR = async ({ spaceId }: { spaceId: string }) => {
  const params: QueryCommandInput = {
    TableName: env.MAIN_TABLE_NAME,
    IndexName: env.CVR_INDEX_NAME,
    KeyConditionExpression: "PK = :PK",
    ExpressionAttributeValues: { ":PK": spaceId },
  };

  try {
    const userCVR = await dynamoClient.send(new QueryCommand(params));
    if (userCVR.Items && userCVR.Items.length > 0) {
      return userCVR.Items as {
        PK: string;
        SK: string;
        version: number;
      }[];
    }
    return [];
  } catch (error) {
    console.log(error);
    throw new Error("failed to get UserCVR");
  }
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
const getLeaderboardCVR = async () => {
  try {
    const [leadersByReward, leadersByQuests] = await Promise.all([
      rocksetClient.queryLambdas.executeQueryLambda(
        "commons",
        "LeaderByReard",
        "bf9b00f53513466d",
        undefined
      ),
      rocksetClient.queryLambdas.executeQueryLambda(
        "commons",
        "LeaderByQuests",
        "ebf8fc9954d19b29",
        undefined
      ),
    ]);
    if (leadersByQuests.results && leadersByReward.results) {
      return [
        ...(leadersByQuests.results as {
          PK: string;
          SK: string;
          version: number;
        }[]),
        ...(leadersByReward.results as {
          PK: string;
          SK: string;
          version: number;
        }[]),
      ];
    }
    return [];
  } catch (error) {
    console.log(error);
    throw new Error("failed to retrieve leaders");
  }
};
const getPublishedQuestsCVR = async () => {
  const scanParams: ScanCommandInput = {
    TableName: env.MAIN_TABLE_NAME,
    IndexName: env.PUBLISHED_QUESTS_CVR_INDEX_NAME,
  };

  try {
    const publishedQuestsCVR = await dynamoClient.send(
      new ScanCommand(scanParams)
    );
    if (publishedQuestsCVR.Items && publishedQuestsCVR.Items.length > 0) {
      return publishedQuestsCVR.Items as {
        PK: string;
        SK: string;
        version: number;
      }[];
    }
    return [];
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get published quests CVR");
  }
};

const getResetPatch = async ({
  spaceId,
  userId,
  page,
}: {
  spaceId: string;
  userId: string | null;
  page: Page;
}) => {
  const { items, page: nextPage } =
    spaceId.startsWith(WORKSPACE) && userId
      ? await getWorkspaceItems({ spaceId, userId, page })
      : spaceId === PUBLISHED_QUESTS
      ? await getPublishedQuestItems({ page })
      : spaceId.startsWith(USER)
      ? await getUserItems({ spaceId, page })
      : spaceId === LEADERBOARD
      ? await getLeaderboardItems({ page })
      : { items: [], page: 0 };
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
      value: item,
    });
  }

  return {
    patch,
    cvr,
    page: nextPage,
  };
};

const recursiveQuery = async (params: QueryCommandInput | ScanCommandInput) => {
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
  page,
}: {
  spaceId: string;
  userId: string;
  page: Page;
}): Promise<{
  items: (Record<string, any> & { PK: string; SK: string; version: number })[];
  page: Page;
}> => {
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
        const { items, page: nextPage } = await getFullItems({ keys, page });
        return {
          items: [...workspaceItems, ...items] as (Record<string, any> & {
            PK: string;
            SK: string;
            version: number;
          })[],
          page: nextPage,
        };
      }
      return {
        items: workspaceItems as (Record<string, any> & {
          PK: string;
          SK: string;
          version: number;
        })[],
        page: "ALL_SYNCED",
      };
    }
    return { items: [], page: "ALL_SYNCED" };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get workspace items");
  }
};
export const getPublishedQuestItems = async ({
  page,
}: {
  page: Page;
}): Promise<{
  items: (Record<string, any> & { PK: string; SK: string; version: number })[];
  page: Page;
}> => {
  const keys = await getPublishedQuestsCVR();
  const fullItems = await getFullItems({ keys, page });
  return fullItems;
};
export const getLeaderboardItems = async ({
  page,
}: {
  page: Page;
}): Promise<{
  items: (Record<string, any> & {
    PK: string;
    SK: string;
    version: number;
  })[];
  page: number | "ALL_SYNCED";
}> => {
  const keys = await getLeaderboardCVR();
  const fullItems = await getFullItems({
    keys,
    page,
    ProjectionExpression:
      "id, SK,  username, #level, profile, rewarded, questsSolved",
  });
  return fullItems;
};
export const getUserItems = async ({
  spaceId,
  page,
}: {
  spaceId: string;
  page: Page;
}): Promise<{
  items: (Record<string, any> & {
    PK: string;
    SK: string;
    version: number;
  })[];
  page: Page;
}> => {
  const keys = await getUserCVR({ spaceId });
  const fullItems = await getFullItems({ keys, page });
  return fullItems;
};

export const getFullItems = async ({
  keys,
  ProjectionExpression,
  page,
}: {
  ProjectionExpression?: string;
  keys: { PK: string; SK: string }[];
  page: Page;
}): Promise<{
  items: Record<string, any> & { PK: string; SK: string; version: number }[];
  page: Page;
}> => {
  try {
    const tableName = env.MAIN_TABLE_NAME;

    // Divide keys into chunks of 100 (BatchGetCommand limit)
    const chunkSize = 100;

    // Calculate start and end indexes for pagination
    const startIndex = page === "ALL_SYNCED" ? 0 * chunkSize : page * chunkSize;
    const endIndex = startIndex + chunkSize;

    // Create a slice for the current page
    const keysSlice = keys.slice(startIndex, endIndex);

    const Keys: Record<string, any>[] = [];

    for (const { PK, SK } of keysSlice) {
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
      ProjectionExpression,
      ...(ProjectionExpression &&
        ProjectionExpression.search("#level") >= 0 && {
          ExpressionAttributeNames: { "#level": "level" },
        }),
    };

    const params: BatchGetCommandInput = {
      RequestItems,
    };

    const result = await dynamoClient.send(new BatchGetCommand(params));
    if (result.Responses && result.Responses[tableName]) {
      return {
        items: result.Responses[tableName] as (Record<string, any> & {
          PK: string;
          SK: string;
          version: number;
        })[],
        page:
          result.Responses[tableName]!.length > 100 && page !== "ALL_SYNCED"
            ? page + 1
            : result.Responses[tableName]!.length > 100 && page === "ALL_SYNCED"
            ? 1
            : ("ALL_SYNCED" as const),
      };
    }
    return { items: [], page: "ALL_SYNCED" as const };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get workspace items");
  }
};

export const getItem = async ({
  spaceId,
  key,
  PK,
}: {
  PK?: string;
  spaceId: string;
  key: string;
}) => {
  const getParams: GetCommandInput = {
    Key: {
      PK: PK ? PK : spaceId,
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
  items: { PK?: string; key: string; value: JSONObject }[];
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
          PK: item.PK ? item.PK : spaceId,

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
  items: { PK?: string; key: string; value: JSONObject }[];
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
  for (const { key, value, PK } of items) {
    const solversCountAttribute = Object.keys(value).some(
      (attr) => attr === "solversCount"
    );
    //attributes that have null as a value are REMOVED
    const attributes = Object.keys(value)
      .map((attribute) => {
        if (value[attribute] === null) return;
        return `#${attribute} = :${attribute}`;
      })
      .filter(Boolean);
    let UpdateExpression = `set ${attributes.join(
      ", "
    )}, #version = #version + :inc`;
    const ExpressionAttributeValues: Record<string, JSONValue | undefined> = {};
    Object.entries(value).forEach(([attr, val]) => {
      if (val === null) {
        UpdateExpression += ` REMOVE #${attr}`;
      } else {
        ExpressionAttributeValues[`:${attr}`] = val;
      }
    });
    const ExpressionAttributeNames: Record<string, JSONValue | undefined> = {};
    Object.entries(value).forEach(([attr, val]) => {
      ExpressionAttributeNames[`#${attr}`] = attr;
    });

    updateItems.push({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      Update: {
        TableName: env.MAIN_TABLE_NAME,
        Key: {
          PK: PK ? PK : spaceId,
          SK: key,
        },

        ExpressionAttributeNames: {
          "#version": "version",

          ...ExpressionAttributeNames,
        },
        ...(solversCountAttribute && {
          ConditionExpression:
            "slots >= :solversCount AND :solversCount>=:zero",
        }),

        UpdateExpression,
        ExpressionAttributeValues: {
          ":inc": 1,
          ...ExpressionAttributeValues,
          ...(solversCountAttribute && { ":zero": 0 }),
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
  const delItems: {
    Delete?:
      | (Omit<Delete, "ExpressionAttributeValues" | "Key"> & {
          Key: Record<string, any> | undefined;
          ExpressionAttributeValues?: Record<string, any> | undefined;
        })
      | undefined;
  }[] = [];
  for (const key of keysToDel) {
    delItems.push({
      Delete: {
        Key: {
          PK: spaceId,

          SK: key,
        },
        TableName: env.MAIN_TABLE_NAME,
      },
    });
    if (key.startsWith("WORK")) {
      delItems.push({
        Delete: {
          Key: {
            PK: spaceId,

            SK: `${contentKey(key.substring(5))}`,
          },
          TableName: env.MAIN_TABLE_NAME,
        },
      });
    }
  }
  const transactUpdateParams: TransactWriteCommandInput = {
    TransactItems: delItems,
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
export const getPrevCVR = async ({ key }: { key: string | undefined }) => {
  if (!key) {
    return undefined;
  }

  try {
    const getResponse = await momento.get(
      env.NEXT_PUBLIC_MOMENTO_CACHE_NAME,
      key
    );
    if (getResponse instanceof CacheGet.Hit) {
      console.log("cache CVR hit!");
      // increasing view count on the quest logic. If user exists and haven't seen the quest by checking whether user has this quest id as a sort key in VIEWS_TABLE.
      const result = JSON.parse(getResponse.valueString()) as ClientViewRecord;

      return result;
    } else if (getResponse instanceof CacheGet.Error) {
      console.log(`Error: ${getResponse.message()}`);
    }
    return undefined;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get item");
  }
};
export const setCVR = async ({
  key,
  CVR,
}: {
  key: string;
  CVR: ClientViewRecord;
}) => {
  try {
    const setResponse = await momento.set(
      env.NEXT_PUBLIC_MOMENTO_CACHE_NAME,
      key,
      JSON.stringify(CVR)
    );
    if (setResponse instanceof CacheSet.Success) {
      console.log("Key CVR stored successfully!");
    } else {
      console.log(`Error setting key: ${setResponse.toString()}`);
    }
  } catch (error) {
    console.log(error);
    throw new Error("failed to set CVR");
  }
};
