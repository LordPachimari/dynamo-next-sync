"use server";
import { rocksetClient } from "~/clients/rockset";

export async function globalSearch(text: string) {
  if (typeof text !== "string") {
    throw new Error("Invalid input.");
  }
  if (text.length === 0) {
    return [];
  }
  try {
    const rocksetResult = await rocksetClient.queryLambdas.executeQueryLambda(
      "commons",
      "GlobalSearch",
      "c2011b5e42702fed",
      {
        parameters: [
          {
            name: "text",
            type: "string",
            value: text,
          },
        ],
      }
    );
    if (rocksetResult.results && rocksetResult.results.length > 0) {
      return rocksetResult.results as Record<string, any>[];
    }
    return [];
  } catch (error) {
    console.log("error in global search", error);
    throw new Error("error in global search");
  }
}
