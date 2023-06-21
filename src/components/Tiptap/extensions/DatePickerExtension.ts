import { mergeAttributes, Node } from "@tiptap/core";
import { EditorState, Plugin, Transaction } from "@tiptap/pm/state";
import { ReplaceStep, Step, StepMap } from "@tiptap/pm/transform";
import { ReactNodeViewRenderer } from "@tiptap/react";
import RewardAndSlotsComponent from "../components/RewardAndSlotsComponent";
import DatePickerComponent from "../components/DatePickerComponent";

export default Node.create({
  name: "dateComponent",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [
      {
        tag: "date-component",
      },
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        filterTransaction: (transaction: Transaction, state: EditorState) => {
          let result = true; // true for keep, false for stop transaction
          const replaceSteps: number[] = [];
          transaction.steps.forEach((step: Step, index: number) => {
            if (step instanceof ReplaceStep) {
              replaceSteps.push(index);
            }
          });

          replaceSteps.forEach((index) => {
            const map = transaction.mapping.maps[index] as StepMap & {
              ranges: number[];
            };
            if (map) {
              const oldStart = map.ranges[0];
              const oldEnd = map.ranges[0]! + map.ranges[1]!;
              state.doc.nodesBetween(oldStart!, oldEnd, (node) => {
                if (node.type.name === "dateComponent") {
                  result = false;
                }
              });
            }
          });
          return result;
        },
      }),
    ];
  },

  addAttributes() {
    return {
      deadline: {
        default: "",
      },
      rep: {
        default: null,
      },
      id: {
        default: null,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["date-component", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DatePickerComponent);
  },
});
