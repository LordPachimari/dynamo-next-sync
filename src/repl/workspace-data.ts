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
