import { NodeViewWrapper } from "@tiptap/react";
import React, { useCallback } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { WorkspaceStore } from "~/zustand/workspace";
import debounce from "lodash.debounce";
import { Topics, TopicsType } from "~/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/Select";
type Node = {
  attrs: {
    topic: TopicsType;
    id: string;
  };
};

export default function SelectComponent(props: {
  [key: string]: any;
  as?: React.ElementType;
  node: Node;

  selected: boolean;
  updateAttributes: (props: { topic: string | "inherit" }) => void;
}) {
  const rep = WorkspaceStore((state) => state.rep);
  const handleTopicChange = async (topic: TopicsType) => {
    props.updateAttributes({ topic });
    if (rep && props.node.attrs.id) {
      await rep.mutate.updateWork({
        id: props.node.attrs.id,
        updates: { topic },
      });
    }
  };

  return (
    <NodeViewWrapper className="mb-2 w-full ">
      {/* <NodeViewContent className="content" /> */}
      <Select
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onValueChange={async (value) => {
          await handleTopicChange(value as TopicsType);
        }}
        defaultValue={props.node.attrs.topic}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select topic" />
        </SelectTrigger>
        <SelectContent>
          {Topics.map((t, i) => (
            <SelectItem value={t} key={i}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </NodeViewWrapper>
  );
}
