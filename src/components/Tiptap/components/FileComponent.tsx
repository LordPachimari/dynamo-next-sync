import { NodeViewWrapper } from "@tiptap/react";
import React from "react";
import styles from "../tiptap.module.css";
type Node = {
  attrs: {
    link: string;
    src: string;
  };
};
export default function FileComponent(props: {
  [key: string]: any;
  node: Node;
  deleteNode: (node: Node) => void;
  as?: React.ElementType;
}) {
  return (
    <NodeViewWrapper className={styles.fileComponent}>
      <div
        className={styles.fileContainer}
        draggable="true"
        data-drag-handle
        contentEditable="false"
      >
        <a href={props.node.attrs.link}>{props.node.attrs.src}</a>
        <button
          className={styles.deleteFileButton}
          onClick={() => {
            props.deleteNode(props.node);
          }}
        >
          X
        </button>
      </div>
    </NodeViewWrapper>
  );
}
