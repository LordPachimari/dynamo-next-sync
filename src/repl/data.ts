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
  QueryCommand,
  QueryCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { JSONObject } from "replicache";
import { dynamoClient } from "~/clients/dynamodb";
import { env } from "~/env.mjs";
import { LastMutationId, SpaceVersion } from "~/types/types";
export const getChangedItems = async ({
  spaceId,
  prevVersion,
}: {
  spaceId: string;
  prevVersion: number;
}) => {
  const queryParams: QueryCommandInput = {
    TableName: env.MAIN_TABLE_NAME,
    KeyConditionExpression: "#PK = :PK",

    FilterExpression: "#version > :version",
    ExpressionAttributeNames: {
      "#PK": "PK",
      "#version": "version",
    },
    ExpressionAttributeValues: {
      ":PK": spaceId,
      ":version": prevVersion,
    },
  };
  console.log("space id from dynamo", spaceId);
  try {
    const result = await dynamoClient.send(new QueryCommand(queryParams));
    if (result.Items) {
      result.Items.pop();

      return result.Items;
    }
    return [];
  } catch (error) {
    console.log(error);
    throw new Error("failed to get changed entries");
  }
};
// export const getItem = async ({
//   spaceId,
//   key,
//   userId,
// }: {
//   spaceId: string;
//   key: string;
//   userId: string;
// }) => {
//   const getParams: GetCommandInput = {
//     Key: {
//       PK: spaceId === "WORKSPACE_LIST" ? `${spaceId}#${userId}` : `${spaceId}`,
//       SK: key,
//     },
//     TableName: env.MAIN_TABLE_NAME,
//   };
//   try {
//     const result = await dynamoClient.send(new GetCommand(getParams));
//     if (result.Item) {
//       return result.Item;
//     }
//     return undefined;
//   } catch (error) {
//     console.log(error);
//     throw new Error("Failed to get item");
//   }
// };
export const putItems = async ({
  spaceId,
  version,
  userId,
  items,
}: {
  spaceId: string;
  items: { key: string; value: JSONObject }[];
  version: number;
  userId: string;
}) => {
  if (items.length === 0) {
    return;
  }

  console.log("putting items ");
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
          version,
        },
      },
    });
  }
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
export const delItems = async ({
  spaceId,
  keysToDel,
  version,
  userId,
}: {
  spaceId: string;
  keysToDel: string[];
  version: number;
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
        UpdateExpression: "SET #inTrash = :value, #version = :version",
        ConditionExpression: "inTrash <> :value",
        ExpressionAttributeNames: {
          "#inTrash": "inTrash",
          "#version": "version",
        },
        ExpressionAttributeValues: { ":value": true, ":version": version },
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

  console.log("deleting items perm");
  const deleteItems: {
    Delete:
      | (Omit<Delete, "ExpressionAttributeValues" | "Key"> & {
          Key: Record<string, any> | undefined;
          ExpressionAttributeValues?: Record<string, any> | undefined;
        })
      | undefined;
  }[] = [];
  for (const key of keysToDel) {
    deleteItems.push({
      Delete: {
        Key: {
          PK: spaceId,
          SK: key,
        },
        TableName: env.MAIN_TABLE_NAME,
      },
    });
  }
  const transactDelParams: TransactWriteCommandInput = {
    TransactItems: deleteItems,
  };
  try {
    await dynamoClient.send(new TransactWriteCommand(transactDelParams));
  } catch (error) {
    console.log(error);
    throw new Error("Transact delete permanently failed");
  }
};
export const getSpaceVersion = async ({
  spaceId,
  userId,
}: {
  userId: string;
  spaceId: string;
}) => {
  const getParam: GetCommandInput = {
    Key: { PK: spaceId, SK: "VERSION" },

    TableName: env.MAIN_TABLE_NAME,
    AttributesToGet: ["version"],
  };
  try {
    console.log("spaceId-------------", spaceId);
    const result = await dynamoClient.send(new GetCommand(getParam));
    if (result.Item) {
      const { version } = result.Item as SpaceVersion;
      return version;
    }
    await setSpaceVersion({ spaceId, version: 0, userId });

    return 0;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get space version");
  }
};
export const setSpaceVersion = async ({
  spaceId,
  version,
  userId,
}: {
  spaceId: string | "WORKSPACE_LIST";
  version: number;
  userId: string;
}) => {
  const lastUpdated = new Date().toISOString();
  const updateParams: UpdateCommandInput = {
    TableName: env.MAIN_TABLE_NAME,
    Key: { PK: spaceId, SK: "VERSION" },

    UpdateExpression: "SET #version = :version, #lastUpdated = :lastUpdated",
    ExpressionAttributeNames: {
      "#version": "version",
      "#lastUpdated": "lastUpdated",
    },
    ExpressionAttributeValues: {
      ":version": version,
      ":lastUpdated": lastUpdated,
    },
  };
  try {
    await dynamoClient.send(new UpdateCommand(updateParams));
  } catch (error) {
    console.log(error);
    throw new Error("failed to set space version");
  }
};
export const getLastMutationIds = async ({
  clientIDs,
  clientGroupID,
}: {
  clientIDs: string[];
  clientGroupID: string;
}) => {
  const tableName = env.MAIN_TABLE_NAME;
  const RequestItems: Record<
    string,
    Omit<KeysAndAttributes, "Keys"> & {
      Keys: Record<string, any>[] | undefined;
    }
  > = {};
  const Keys = clientIDs.map((id) => ({
    PK: `CLIENT_GROUP#${clientGroupID}`,
    SK: `CLIENT#${id}`,
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
          return [val.id, val.lastMutationId ?? 0] as const;
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
  prevVersion,
}: {
  clientGroupId: string;
  prevVersion: number;
}) => {
  const queryParams: QueryCommandInput = {
    TableName: env.MAIN_TABLE_NAME,
    KeyConditionExpression: "#PK = :PK",

    FilterExpression: "#version > :version",
    ExpressionAttributeNames: {
      "#PK": "PK",
      "#version": "version",
    },
    ExpressionAttributeValues: {
      ":PK": `CLIENT_GROUP#${clientGroupId}`,
      ":version": prevVersion,
    },
  };
  try {
    const result = await dynamoClient.send(new QueryCommand(queryParams));
    if (result.Items) {
      const lastMutationIDArray = result.Items as LastMutationId[];
      lastMutationIDArray.pop();
      return Object.fromEntries(
        lastMutationIDArray.map((l) => [l.id, l.lastMutationId] as const)
      );
    }
    return {};
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get client IDS");
  }
};
export const setLastMutationId = async ({
  clientId,
  lastMutationId,
  clientGroupId,
}: {
  clientId: string;
  lastMutationId: number;
  clientGroupId: string;
}) => {
  const updateParams: UpdateCommandInput = {
    TableName: env.MAIN_TABLE_NAME,

    Key: { PK: `CLIENT_GROUP#${clientGroupId}`, SK: `CLIENT#${clientId}` },
    UpdateExpression: "SET #lastMutationId = :lastMutationId, #id = :id",
    ExpressionAttributeNames: {
      "#lastMutationId": "lastMutationId",
      "#id": "id",
    },
    ExpressionAttributeValues: {
      ":lastMutationId": lastMutationId,
      ":id": clientId,
    },
  };
  try {
    await dynamoClient.send(new UpdateCommand(updateParams));
  } catch (error) {
    console.log(error);
    throw new Error("failed to set last mutation");
  }
};
export const setLastMutationIds = async ({
  clientGroupId,
  version,
  lmids,
}: {
  clientGroupId: string;
  lmids: Record<string, number>;
  version: number;
}) => {
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
          TableName: env.MAIN_TABLE_NAME,
          Key: {
            PK: `CLIENT_GROUP#${clientGroupId}`,
            SK: `CLIENT#${clientId}`,
          },
          UpdateExpression:
            "SET #id = :id, #lastMutationId = :lastMutationId, #version = :version",
          ExpressionAttributeNames: {
            "#id": "id",
            "#lastMutationId": "lastMutationId",
            "#version": "version",
          },
          ExpressionAttributeValues: {
            ":id": clientId,
            ":lastMutationId": lastMutationId,
            ":version": version,
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
