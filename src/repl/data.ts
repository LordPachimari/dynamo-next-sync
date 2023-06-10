import "server-only";
import { Delete, Put, Update } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  GetCommandInput,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { ExperimentalDiff, JSONObject, JSONValue } from "replicache";

import { env } from "../env.mjs";
import { dynamoClient } from "~/clients/dynamodb";
import { LastMutationId, SpaceVersion } from "~/types/types";

export const publicSpaces = new Set(["PUBLISHED_QUESTS", "LEADERBOARD"]);
export const getSpaceVersion = async ({
  spaceId,
  userId,
}: {
  userId: string;
  spaceId: string;
}) => {
  const getParam: GetCommandInput = {
    Key:
      //each workspace list is a private list. So each user can view only its own workspace list.
      spaceId === "WORKSPACE_LIST"
        ? { PK: `${spaceId}#${userId}`, SK: "VERSION" }
        : { PK: `${spaceId}`, SK: "VERSION" },

    TableName: env.MAIN_TABLE_NAME,
    AttributesToGet: ["version"],
  };
  try {
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
    Key:
      spaceId === "WORKSPACE_LIST"
        ? { PK: `${spaceId}#${userId}`, SK: `VERSION` }
        : { PK: `${spaceId}`, SK: "VERSION" },

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
export const getLastMutationId = async ({ clientId }: { clientId: string }) => {
  const getParam: GetCommandInput = {
    Key: { PK: `CLIENT#${clientId}`, SK: "LAST_MUTATION_ID" },
    TableName: env.MAIN_TABLE_NAME,
    AttributesToGet: ["lastMutationId"],
  };
  try {
    const result = await dynamoClient.send(new GetCommand(getParam));
    if (result.Item) {
      const { lastMutationId } = result.Item as LastMutationId;
      return lastMutationId;
    }
    return undefined;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get last mutation");
  }
};
export const setLastMutationId = async ({
  clientId,
  lastMutationId,
}: {
  clientId: string;
  lastMutationId: number;
}) => {
  const updateParams: UpdateCommandInput = {
    TableName: env.MAIN_TABLE_NAME,

    Key: { PK: `CLIENT#${clientId}`, SK: "LAST_MUTATION_ID" },
    UpdateExpression: "SET #lastMutationId = :lastMutationId",
    ExpressionAttributeNames: { "#lastMutationId": "lastMutationId" },
    ExpressionAttributeValues: { ":lastMutationId": lastMutationId },
  };
  try {
    await dynamoClient.send(new UpdateCommand(updateParams));
  } catch (error) {
    console.log(error);
    throw new Error("failed to set last mutation");
  }
};
export const getChangedItems = async ({
  spaceId,
  prevVersion,
  userId,
}: {
  spaceId: string;
  prevVersion: number;
  userId: string;
}) => {
  if (spaceId.startsWith("GUILD#")) {
    // check whether user is founder or member of the guild
  }
  const queryParams: QueryCommandInput = {
    TableName: env.MAIN_TABLE_NAME,
    KeyConditionExpression: "#PK = :PK",

    FilterExpression: "#version > :version",
    ExpressionAttributeNames: { "#PK": "PK", "#version": "version" },
    ExpressionAttributeValues: {
      ":PK": spaceId === "WORKSPACE_LIST" ? `${spaceId}#${userId}` : spaceId,
      ":version": prevVersion,
    },
  };
  try {
    const result = await dynamoClient.send(new QueryCommand(queryParams));
    if (result.Items) {
      //pop the last item. Why: cause the last item is WORKSPACE_LIST space version.
      //workspace list version is stored under the same Partition key PK:"WORKPSACE_LIST#<userId>" as user quests and solutions, with sort key SK:"VERSION"
      //as the items are ordered by SK lexicographically, "VERSION" starts with "V" so it will be in the last item of a scan result.
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
          PK:
            spaceId === "WORKSPACE_LIST"
              ? `${spaceId}#${userId}`
              : `${spaceId}`,
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
          PK:
            spaceId === "WORKSPACE_LIST"
              ? `${spaceId}#${userId}`
              : `${spaceId}`,
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
          PK:
            spaceId === "WORKSPACE_LIST"
              ? `${spaceId}#${userId}`
              : `${spaceId}`,
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
