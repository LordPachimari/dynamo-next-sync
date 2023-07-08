import { Editor } from "@tiptap/core";
import { NodeViewWrapper } from "@tiptap/react";
import { ImageIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { useUploadThing } from "~/utils/useUploadThing";

type Node = {
  attrs: Record<string, string>;
};
export default function ImageUploader(props: {
  [key: string]: any;
  as?: React.ElementType;
  editor: Editor;
  node: Node;
  deleteNode: (node: Node) => void;

  selected: boolean;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading, permittedFileInfo } = useUploadThing({
    endpoint: "imageUploader",
    onClientUploadComplete: (res) => {
      console.log("hello?", res);

      toast.success("Image successfully uploaded");
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      if (res) {
        // handleImageUpload({ res, view: props.editor.view, event });

        for (let i = 0; i < res.length; i++) {
          const { fileKey, fileUrl } = res[i]!;
          props.editor
            .chain()
            .focus()
            // .setImage({ src: `${imageUrl}` })
            .insertContent(
              i === res.length - 1
                ? `<Imagecomponent src=${fileUrl} alt=${fileKey} title=${fileKey}></Imagecomponent><p></p>`
                : `<Imagecomponent src=${fileUrl} alt=${fileKey} title=${fileKey}></Imagecomponent>`
            )

            .run();
        }

        props.deleteNode(props.node);
      }
    },
  });
  console.log("permitted info", permittedFileInfo);
  //   const { fileTypes, multiple } = generatePermittedFileTypes(
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  //     permittedFileInfo!.config
  //   );
  const imageInputClick = () => {
    imageInputRef.current?.click();
  };

  return (
    <NodeViewWrapper>
      <div className="relative my-3 w-full">
        {isUploading ? (
          <span className="absolute flex h-10 w-full cursor-pointer items-center gap-3 rounded-sm bg-orange-50 p-2 hover:bg-orange-100">
            Loading...
          </span>
        ) : (
          <span
            className="absolute flex h-10 w-full cursor-pointer items-center gap-3 rounded-sm bg-orange-50 p-2 hover:bg-orange-100"
            onClick={imageInputClick}
          >
            <ImageIcon size={25} className="text-orange-400" />
            <p className="text-orange-400">{`Image upload (8MB)`}</p>
          </span>
        )}

        <input
          name="image"
          type="file"
          accept={"images/*"}
          className="hidden"
          ref={imageInputRef}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onChange={async (event) => {
            if (event.target.files?.length) {
              await startUpload(Array.from(event.target.files));
            }
          }}
        />
      </div>
    </NodeViewWrapper>
  );
}
