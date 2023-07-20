/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"server-only";
import { serialize } from "next-mdx-remote/serialize";
import { visit } from "unist-util-visit";
import { redis } from "~/clients/redis";
import { contentKey } from "~/repl/client/mutators/workspace";
export async function getPublishedContent(id: string) {
  // const params: GetCommandInput = {
  //   TableName: env.MAIN_TABLE_NAME,
  //   Key: { PK: contentKey(id), SK: contentKey(id) },
  // };
  try {
    // const result = await dynamoClient.send(new GetCommand(params));

    // if (result.Item) {
    //   return result.Item as PublishedContent;
    // }
    const content = (await redis.get(contentKey(id))) as string | undefined;
    if (content) {
      return content;
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
      if (node.name == "imagecomponent") {
        node.name = "ImageComponent";
      }
    });
  };
}

// function replaceLinksMdx() {
//   return (tree: any) =>
//     new Promise<void>((resolve, reject) => {
//       const nodesToChange: any[] = [];

//       visit(tree, "text", (node) => {
//         if (node.value.match(/<([^>]*)>/g)) {
//           nodesToChange.push({
//             node,
//           });
//         }
//       });

//       for (const { node } of nodesToChange) {
//         try {
//           const regex = /<([^>]*)>/gm;
//           const matches = regex.exec(node.value);
//           if (!matches) throw new Error(`Failed to parse URL: ${node.value}`);

//           const url = matches[1];

//           node.type = "link";
//           node.url = url;
//           node.children = [{ type: "text", value: "Link" }];
//         } catch (e) {
//           console.log("ERROR", e);
//           return reject(e);
//         }
//       }

//       resolve();
//     });
// }
