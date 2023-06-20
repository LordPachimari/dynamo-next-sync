import { NodeViewWrapper } from "@tiptap/react";
import React, { useCallback, useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { WorkspaceStore } from "~/zustand/workspace";
import debounce from "lodash.debounce";
import {
  SubtopicSuggestion,
  SubtopicsType,
  Topics,
  TopicsType,
} from "~/types/types";
import Select, { MultiValue, StylesConfig } from "react-select";

import makeAnimated from "react-select/animated";
type Node = {
  attrs: {
    subtopic: string[];
    id: string;
  };
};
const animatedComponents = makeAnimated();
export interface OptionType {
  value: string;
  label: string;
}

const customStyles: StylesConfig<OptionType, false> = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "orange" : base.borderColor,
    boxShadow: state.isFocused ? "0 0 0 0.2px orange" : base.boxShadow,
    "&:hover": {
      borderColor: state.isFocused ? "orange" : base.borderColor,
    },
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isFocused ? "whitesmoke" : "",
      color: "black",
    };
  },
};
export default function SubtopicComponent(props: {
  [key: string]: any;
  as?: React.ElementType;
  node: Node;

  selected: boolean;
  updateAttributes: (props: { subtopic: string[] | "inherit" }) => void;
}) {
  const rep = WorkspaceStore((state) => state.rep);
  const [subtopicState, setSubtopicState] = useState<MultiValue<OptionType>>();
  useEffect(() => {
    const multiVal = props.node.attrs.subtopic
      ? props.node.attrs.subtopic.map((v) => ({ value: v, label: v }))
      : [];
    setSubtopicState(multiVal as MultiValue<OptionType>);
  }, [props.node.attrs.subtopic]);
  const options = SubtopicSuggestion.map((topic) => ({
    value: topic,
    label: topic.toLocaleLowerCase(),
  }));
  const handleSubtopicChange = async (subtopics: MultiValue<OptionType>) => {
    const strings = subtopics.map((val) => val.value);
    props.updateAttributes({ subtopic: strings });
    if (rep) {
      await rep.mutate.updateWork({
        id: props.node.attrs.id,
        updates: { subtopic: strings },
      });
    }
  };

  return (
    <NodeViewWrapper className="mb-2 w-full">
      <Select
        options={options}
        components={animatedComponents}
        isMulti
        value={subtopicState}
        placeholder="Select subtopic"
        closeMenuOnSelect={false}
        classNames={{
          control: (state) => (state.isFocused ? "#f97316" : "border-grey-300"),
        }}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onChange={async (val) => {
          await handleSubtopicChange(val);

          setSubtopicState(val);
        }}
      />
    </NodeViewWrapper>
  );
}
