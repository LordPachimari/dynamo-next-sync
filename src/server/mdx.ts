"server-only";
import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { serialize } from "next-mdx-remote/serialize";
import { dynamoClient } from "~/clients/dynamodb";
import { env } from "~/env.mjs";
import { contentKey } from "~/repl/client/mutators/workspace";
import { PublishedContent } from "~/types/types";

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
  const mdxSource = await serialize(markdown);

  return mdxSource;
}
// export function replaceExamples() {
//   return (tree: any) =>
//     new Promise<void>(async (resolve, reject) => {
//       const nodesToChange = new Array();

//       visit(tree, "mdxJsxFlowElement", (node: any) => {
//         if (node.name == "Examples") {
//           nodesToChange.push({
//             node,
//           });
//         }
//       });
//       for (const { node } of nodesToChange) {
//         try {
//           const data = await getExamples(node, prisma);
//           node.attributes = [
//             {
//               type: "mdxJsxAttribute",
//               name: "data",
//               value: data,
//             },
//           ];
//         } catch (e) {
//           return reject(e);
//         }
//       }

//       resolve();
//     });
// }
