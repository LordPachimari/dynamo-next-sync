import { NodeViewWrapper } from "@tiptap/react";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { WorkspaceStore } from "~/zustand/workspace";
import debounce from "lodash.debounce";
import {
  SubtopicSuggestion,
  SubtopicsType,
  Topics,
  TopicsType,
} from "~/types/types";
import { Gem, Users2 } from "lucide-react";
import { Input } from "~/ui/Input";

type Node = {
  attrs: {
    reward: number;
    slots: number;
    id: string;
  };
};

export default function RewardAndSlotsComponent(props: {
  [key: string]: any;
  as?: React.ElementType;
  node: Node;

  selected: boolean;
  updateAttributes: (props: {
    reward?: number | "inherit";
    slots?: number | "inherit";
  }) => void;
}) {
  const rep = WorkspaceStore((state) => state.rep);

  const handleRewardChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const reward = e.currentTarget.valueAsNumber || 0;
    props.updateAttributes({ reward });
    if (rep && props.node.attrs.id) {
      await rep.mutate.updateWork({
        id: props.node.attrs.id,
        updates: { reward },
      });
    }
  };
  const handleSlotsChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const slots = e.currentTarget.valueAsNumber || 0;
    props.updateAttributes({ slots });
    if (rep && props.node.attrs.id) {
      await rep.mutate.updateWork({
        id: props.node.attrs.id,
        updates: { slots },
      });
    }
  };

  return (
    <NodeViewWrapper className="w-full">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex items-center gap-2  ">
          <Gem className="text-purple-500" />
          <Input
            className="w-40 p-2 "
            placeholder="Enter amount"
            defaultValue={props.node.attrs.reward}
            type="number"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onChange={handleRewardChange}
            min={1}
          />
        </div>
        <div className="flex items-center gap-2">
          <Users2 className="text-gray-500" />
          <Input
            className="w-40 p-2 "
            placeholder="Enter amount"
            defaultValue={props.node.attrs.slots}
            type="number"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onChange={handleSlotsChange}
            min={1}
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
