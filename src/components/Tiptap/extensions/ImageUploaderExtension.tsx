import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import ImageUploader from "../components/ImageUploader";

export default Node.create({
  name: "imageUploader",

  group: "block",
  draggable: true,

  parseHTML() {
    return [
      {
        tag: "image-uploader",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["image-uploader", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploader);
  },
});
