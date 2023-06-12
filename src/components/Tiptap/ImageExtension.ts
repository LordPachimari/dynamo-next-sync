import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import ImageComponent from "./ImageComponent";

export default Node.create({
  name: "imageComponent",

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

      height: { default: 300 },
    };
  },

  parseHTML() {
    return [
      {
        tag: "image-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["image-component", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
