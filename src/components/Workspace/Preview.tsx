import {
  Content,
  MergedWorkType,
  Quest,
  Solution,
  WorkType,
} from "~/types/types";
import {
  NonEditableContent,
  NonEditableQuestAttributes,
  NonEditableSolutionAttributes,
} from "./NonEditable";
import { yDocToProsemirror, yDocToProsemirrorJSON } from "y-prosemirror";
import * as Y from "yjs";
import { JSONContent } from "@tiptap/core";
import { useSubscribe } from "replicache-react";
import { YJSKey } from "~/repl/mutators";
import * as base64 from "base64-js";
import { WorkspaceStore } from "~/zustand/workspace";
export const Preview = ({ work, ydoc }: { work: WorkType; ydoc: Y.Doc }) => {
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
