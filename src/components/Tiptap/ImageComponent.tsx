import { NodeViewWrapper } from "@tiptap/react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import ImageResizer from "./ImageResizer";
import styles from "./tiptap.module.css";

type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};
type Node = {
  attrs: {
    width: number;
    height: number;
    src: string;
  };
};
export default function ImageComponent(props: {
  [key: string]: any;
  as?: React.ElementType;
  node: Node;

  selected: boolean;
  updateAttributes: (props: {
    width: number | "inherit";
    height: number | "inherit";
  }) => void;
}) {
  const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  };
  const imageRef = useRef<null | HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const onResizeEnd = (
    nextWidth: "inherit" | number,
    nextHeight: "inherit" | number
  ) => {
    setTimeout(() => {
      setIsResizing(false);
    }, 200);
    props.updateAttributes({
      width: nextWidth,
      height: nextHeight,
    });
  };

  const onResizeStart = () => {
    setIsResizing(true);
  };
  const isFocused = isResizing || props.selected;
  return (
    <NodeViewWrapper className={styles.imageParentContainer}>
      <div className={styles.imageContainer} contentEditable="false">
        <span className={styles.editorImage}>
          <div draggable="true" data-drag-handle>
            <Image
              ref={imageRef}
              className={props.selected ? styles.selected : undefined}
              loader={imageLoader}
              src={props.node.attrs.src}
              width={props.node.attrs.width}
              height={props.node.attrs.height}
              priority
              alt="image"
              sizes="(max-width: 768px) 90vw, (min-width: 1024px) 400px"
              // fill={true}
            />
          </div>
          {isFocused && (
            <ImageResizer
              imageRef={imageRef}
              maxWidth={500}
              maxHeight={500}
              onResizeStart={onResizeStart}
              onResizeEnd={onResizeEnd}
            />
          )}
        </span>
      </div>
    </NodeViewWrapper>
  );
}
