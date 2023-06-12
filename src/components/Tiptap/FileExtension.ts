import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import FileComponent from "./FileComponent";

export default Node.create({
  name: "fileComponent",

  group: "block",
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: "",
      },
      link: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "file-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["file-component", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileComponent);
  },
});
