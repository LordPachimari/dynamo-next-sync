import { getMdxSource, getPublishedContent } from "~/server/mdx";
import QuestPage from "../../../../../components/Quests/QuestPage";
import { MDXRemoteProps } from "next-mdx-remote";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const content = await getPublishedContent(id);
  let mdxSource: MDXRemoteProps | null = null;
  if (content) {
    mdxSource = await getMdxSource(content);
  }

  return <QuestPage id={id} mdxSource={mdxSource} />;
}
