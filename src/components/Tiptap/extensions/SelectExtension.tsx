import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import Title from "../components/TitleComponent";
import SelectComponent from "../components/SelectComponent";
import { EditorState, Plugin, PluginKey, Transaction } from "@tiptap/pm/state";
import { Schema } from "@tiptap/pm/model";
import { ReplaceStep, Step, StepMap } from "@tiptap/pm/transform";

export default Node.create({
  name: "selectComponent",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [
      {
        tag: "select-component",
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
                console.log("hello", node);
                if (node.type.name === "selectComponent") {
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
      topic: {
        default: "",
      },

      id: {
        default: null,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["select-component", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SelectComponent);
  },
});
