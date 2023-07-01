import { yDocToProsemirrorJSON } from "y-prosemirror";
import * as Y from "yjs";
import { MergedWorkType, Quest, Solution, WorkType } from "~/types/types";
import {
  NonEditableContent,
  NonEditableQuestAttributes,
  NonEditableSolutionAttributes,
} from "./NonEditable";
export const Preview = ({
  work,
  ydoc,
}: {
  work: MergedWorkType;
  ydoc: Y.Doc;
}) => {
  const contentJSON = yDocToProsemirrorJSON(ydoc, "content");

  if (work.type === "QUEST") {
    return (
      <>
        <NonEditableQuestAttributes quest={work as Quest} />
        {contentJSON && <NonEditableContent content={contentJSON} />}
      </>
    );
  }
  if (work.type === "SOLUTION") {
    return (
      <>
        <NonEditableSolutionAttributes solution={work as Solution} />
        {contentJSON && <NonEditableContent content={contentJSON} />}
      </>
    );
  }
  return <>hello</>;
};
export default Preview;
