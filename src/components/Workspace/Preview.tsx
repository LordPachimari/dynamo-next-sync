import { yDocToProsemirrorJSON } from "y-prosemirror";
import * as Y from "yjs";
import { MergedWork, Quest, Solution, WorkType } from "~/types/types";
import {
  NonEditableQuestAttributes,
  NonEditableSolutionAttributes,
} from "./NonEditableAttributes";
import NonEditableContent from "./NonEditableContent";
import { MDXRemoteProps } from "next-mdx-remote";
export const Preview = ({
  work,
  mdxSource,
}: {
  work: MergedWork;
  mdxSource: MDXRemoteProps;
}) => {
  if (work.type === "QUEST") {
    return (
      <>
        <NonEditableQuestAttributes quest={work as Quest} />
        <NonEditableContent mdxSource={mdxSource} />
      </>
    );
  }
  if (work.type === "SOLUTION") {
    return (
      <>
        <NonEditableSolutionAttributes solution={work as Solution} />
        <NonEditableContent mdxSource={mdxSource} />
      </>
    );
  }
  return <>hello</>;
};
export default Preview;
