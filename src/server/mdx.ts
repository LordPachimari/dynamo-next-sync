/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"server-only";
import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { serialize } from "next-mdx-remote/serialize";
import { dynamoClient } from "~/clients/dynamodb";
import { env } from "~/env.mjs";
import { contentKey } from "~/repl/client/mutators/workspace";
import { PublishedContent } from "~/types/types";
import { visit } from "unist-util-visit";
export async function getPublishedContent(id: string) {
  const params: GetCommandInput = {
    TableName: env.MAIN_TABLE_NAME,
    Key: { PK: contentKey(id), SK: contentKey(id) },
  };
  try {
    const result = await dynamoClient.send(new GetCommand(params));

    if (result.Item) {
      return result.Item as PublishedContent;
    }
    return null;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to retrieve user");
  }
}
export async function getMdxSource(markdown: string) {
  // Serialize the content string into MDX
  const mdxSource = await serialize(markdown, {
    mdxOptions: {
      remarkPlugins: [replaceCustomeNodeNames],
    },
  });

  return mdxSource;
}
export function replaceCustomeNodeNames() {
  return (tree: any) => {
    visit(tree, "mdxJsxFlowElement", (node: any) => {
      console.log(node);
      if (node.name == "imagecomponent") {
        node.name = "ImageComponent";
      }
    });
  };
}
