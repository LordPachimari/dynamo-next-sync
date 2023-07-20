"server-only";
import {
  QueryCommand,
  QueryCommandInput
} from "@aws-sdk/lib-dynamodb";
import { cache } from "react";
import { dynamoClient } from "~/clients/dynamodb";
import { env } from "~/env.mjs";
import { User } from "~/types/types";

export const userByUsername = cache(
  async ({ username }: { username: string }) => {
    const params: QueryCommandInput = {
      TableName: env.MAIN_TABLE_NAME,
      IndexName: env.USERNAME_INDEX,
      KeyConditionExpression: "username = :username AND begins_with(SK, :SK)",
      ExpressionAttributeValues: { ":username": username, ":SK": "USER#" },
    };
    try {
      const result = await dynamoClient.send(new QueryCommand(params));

      if (result.Items && result.Items.length > 0) {
        return result.Items[0] as User;
      }
      return null;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to retrieve user");
    }
  }
);
// export const userComponent = async ({ id }: { id: string }) => {
//   const params: GetCommandInput = {
//     TableName: env.MAIN_TABLE_NAME,

//     Key: { PK: userKey(id), SK: userKey(id) },
//     ProjectionExpression: "#id, #username, #level, #profile, #verified",
//     ExpressionAttributeNames: {
//       "#id": "id",
//       "#username": "username",
//       "#level": "level",
//       "#profile": "profile",
//       "#verified": "verified",
//     },
//   };
//   try {
//     const result = await dynamoClient.send(new GetCommand(params));
//     if (result.Item) {
//       const userComponent = result.Item as UserComponent;
//       return userComponent;
//     }
//     return null;
//   } catch (error) {
//     console.log(error);
//     throw new Error("failed to retrieve user");
//   }
// };
