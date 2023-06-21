import { NodeViewWrapper } from "@tiptap/react";
import React, { useCallback } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { WorkspaceStore } from "~/zustand/workspace";
import debounce from "lodash.debounce";
type Node = {
  attrs: {
    title: string;
    id: string;
    rep: string;
  };
};

export default function Title(props: {
  [key: string]: any;
  as?: React.ElementType;
  node: Node;

  selected: boolean;
  updateAttributes: (props: { title: string | "inherit" }) => void;
}) {
  const rep = WorkspaceStore((state) => state.rep);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTitleChange = useCallback(
    debounce(async (title: string) => {
      console.log("title changed", title);
      props.updateAttributes({ title });
      console.log("props", props.node.attrs.id);
      if (rep && props.node.attrs.id) {
        await rep.mutate.updateWork({
          id: props.node.attrs.id,
          updates: { title },
        });
      }
    }, 1000),
    []
  );
  return (
    <NodeViewWrapper className="mb-2 w-full">
      <TextareaAutosize
        autoFocus
        id="title"
        defaultValue={props.node.attrs.title || ""}
        placeholder="Write title here"
        className="w-full resize-none appearance-none overflow-hidden bg-transparent text-4xl font-bold focus:outline-none"
        // {...register("title")}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onInput={(e) => handleTitleChange(e.currentTarget.value)}
      />

      {/* <NodeViewContent className="content" /> */}
    </NodeViewWrapper>
  );
}
