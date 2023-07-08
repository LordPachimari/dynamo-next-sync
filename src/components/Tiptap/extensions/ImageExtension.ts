import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import ImageComponent from "../components/ImageComponent";

import { EditorState, Plugin, PluginKey, Transaction } from "@tiptap/pm/state";
import { Schema } from "@tiptap/pm/model";
import { ReplaceStep, Step, StepMap } from "@tiptap/pm/transform";
export default Node.create({
  name: "Imagecomponent",

  group: "block",
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: "",
      },
      width: {
        default: 400,
      },
      alt: {
        default: "image",
      },
      title: {
        default: "image",
      },

      height: { default: 300 },
    };
  },

  parseHTML() {
    return [
      {
        tag: "Imagecomponent",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["Imagecomponent", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
