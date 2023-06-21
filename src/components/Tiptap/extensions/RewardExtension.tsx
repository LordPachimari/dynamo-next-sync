import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import Title from "../components/TitleComponent";
import SelectComponent from "../components/SelectComponent";
import { EditorState, Plugin, PluginKey, Transaction } from "@tiptap/pm/state";
import { Schema } from "@tiptap/pm/model";
import { ReplaceStep, Step, StepMap } from "@tiptap/pm/transform";
import RewardAndSlotsComponent from "../components/RewardAndSlotsComponent";

export default Node.create({
  name: "rewardComponent",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [
      {
        tag: "reward-component",
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
                if (node.type.name === "rewardComponent") {
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
      reward: {
        default: 0,
      },
      slots: {
        default: 0,
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
    return ["reward-component", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RewardAndSlotsComponent);
  },
});
