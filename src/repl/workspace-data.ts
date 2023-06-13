import {
  BatchGetCommand,
  BatchGetCommandInput,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import "server-only";

import { dynamoClient } from "~/clients/dynamodb";
import { env } from "../env.mjs";
import { KeysAndAttributes } from "@aws-sdk/client-dynamodb";
import { Content, Quest } from "~/types/types";

export const getWorkspaceListChangedItems = async ({
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
      "#type": "type",
    },
    ExpressionAttributeValues: {
      ":PK": spaceId,
      ":version": prevVersion,
    },
    ProjectionExpression: "id, title, topic, inTrash, published, SK, #type",
  };
  console.log("space id from dynamo", spaceId);
  try {
    const result = await dynamoClient.send(new QueryCommand(queryParams));
    if (result.Items) {
      console.log("workspacelist dynamo", prevVersion, result);
      result.Items.pop();

      return result.Items;
    }
    return [];
  } catch (error) {
    console.log(error);
    throw new Error("failed to get changed entries");
  }
};
export const getWorkspaceWork = async ({
  userId,
  spaceId,
}: {
  userId: string;
  spaceId: string;
}) => {
  const tableName = env.MAIN_TABLE_NAME;
  const RequestItems: Record<
    string,
    Omit<KeysAndAttributes, "Keys"> & {
      Keys: Record<string, any>[] | undefined;
    }
  > = {};
  RequestItems[tableName] = {
    Keys: [
      { PK: `WORKSPACE_LIST#${userId}`, SK: spaceId },
      { PK: spaceId, SK: `CONTENT#${spaceId}` },
    ],
  };
  const batchParams: BatchGetCommandInput = {
    RequestItems,
  };
  try {
    const result = await dynamoClient.send(new BatchGetCommand(batchParams));
    if (result.Responses) {
      console.log("result dynamo work", spaceId, result.Responses[tableName]);
      return result.Responses[tableName] || [];
    }
    return [];
  } catch (error) {
    throw new Error("Failed to get work");
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
