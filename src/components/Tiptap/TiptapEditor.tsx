import * as Toolbar from "@radix-ui/react-toolbar";
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor,
} from "@tiptap/react";
import debounce from "lodash.debounce";
import { Bold, Image as ImageIcon, Italic, Strikethrough } from "lucide-react";
import {
  ChangeEvent,
  Dispatch,
  MutableRefObject,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Y from "yjs";
import { Button } from "~/ui/Button";
import { cn } from "~/utils/cn";
import { TiptapExtensions } from "./extensions";
import Collaboration from "@tiptap/extension-collaboration";
import { useSubscribe } from "replicache-react";
import { WorkspaceStore } from "~/zustand/workspace";
import { YJSKey, editorKey } from "~/repl/mutators";
import * as base64 from "base64-js";
import { YJSContent } from "~/types/types";
import { TiptapEditorProps } from "./props";
import { EditorBubbleMenu } from "./components/EditorBubleMenu";
import { useUploadThing } from "~/utils/useUploadThing";
import { toast } from "sonner";
import { generatePermittedFileTypes } from "./utils/imageUpload";
const TiptapEditor = (props: {
  id: string;
  ydoc: Y.Doc;
  setRenderCount: Dispatch<SetStateAction<number>>;
  renderCount: number;
}) => {
  const { id, ydoc, setRenderCount, renderCount } = props;
  const rep = WorkspaceStore((state) => state.rep);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading, permittedFileInfo } = useUploadThing({
    endpoint: "imageUploader",
    onClientUploadComplete: (res) => {
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    },
    onUploadError: (error: Error) => {
      toast.error("Failed to upload");
    },
  });

  const Ydoc = useSubscribe(
    rep,
    async (tx) => {
      const content = (await tx.get(YJSKey(id))) as YJSContent;
      console.log(content);
      if (content && content.Ydoc) {
        console.log("ydoc from subscribe", content.Ydoc);
        if (ydoc) {
          console.log("updating yjs");
          const update = base64.toByteArray(content.Ydoc);
          Y.applyUpdateV2(ydoc, update);
        }
        return content.Ydoc;
      }
      return null;
    },
    null,
    [ydoc]
  );

  console.log("render count", renderCount);

  // const ydoc = useMemo(() => new Y.Doc(), [id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateContent = useCallback(
    debounce(async () => {
      console.log("update", ydoc, rep);
      if (ydoc) {
        const update = Y.encodeStateAsUpdateV2(ydoc);
        if (rep) {
          console.log("mutating");
          // await Promise.all([
          await rep.mutate.updateYJS({
            id,
            update: { Ydoc: base64.fromByteArray(update) },
          });
          // ]);
        }
      }
    }, 1000),
    [ydoc, id]
  );

  const editor = useEditor(
    {
      editorProps: {
        attributes: {
          class: "prose-lg prose-headings:font-sans focus:outline-none",
        },
        handleDOMEvents: {
          keydown: (_view, event) => {
            // prevent default event listeners from firing when slash command is active
            if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
              const slashCommand = document.querySelector("#slash-command");
              if (slashCommand) {
                return true;
              }
            }
          },
        },
        handlePaste: (view, event) => {
          if (renderCount < 3) {
            void updateContent();
          }
          if (event.clipboardData && event.clipboardData.files) {
            event.preventDefault();
            //   return handleImageUpload(file, view, event);
            if (event.clipboardData.files?.length) {
              if (event.clipboardData.files?.length) {
                startUpload(Array.from(event.clipboardData.files))
                  .then((res) => {
                    if (res) {
                      for (let i = 0; i < res.length; i++) {
                        const { fileKey, fileUrl } = res[i]!;
                        view.dispatch(
                          view.state.tr.replaceSelectionWith(
                            view.state.schema.nodes.imageComponent!.create({
                              src: fileUrl,
                              alt: fileKey,
                              title: fileKey,
                            })
                          )
                        );
                      }
                    }

                    toast.success("Image successfully uploaded");
                  })
                  .catch((err) => console.log(err));
              }
            }
          }
        },
        handleDrop: (view, event, _slice, moved) => {
          if (renderCount < 3) {
            void updateContent();
          }
          if (!moved && event.dataTransfer && event.dataTransfer.files) {
            event.preventDefault();
            if (event.dataTransfer.files?.length) {
              startUpload(Array.from(event.dataTransfer.files))
                .then((res) => {
                  if (res) {
                    for (let i = 0; i < res.length; i++) {
                      const { fileKey, fileUrl } = res[i]!;

                      const { schema } = view.state;
                      const coordinates = view.posAtCoords({
                        left: event.clientX,
                        top: event.clientY,
                      });

                      const node = schema.nodes.imageComponent!.create({
                        src: fileUrl,
                        alt: fileKey,
                        title: fileKey,
                      }); // creates the image element
                      const transaction = view.state.tr.insert(
                        coordinates?.pos || 0,
                        node
                      ); // places it in the correct position

                      toast.success("Image successfully uploaded");
                      return view.dispatch(transaction);
                    }
                  }
                })
                .catch((err) => console.log(err));
            }
          }
          // return false;
        },
      },
      extensions: [
        ...TiptapExtensions,

        Collaboration.configure({
          document: ydoc,
          field: "content",
        }),
      ],

      autofocus: "end",
      // onCreate: () => {
      //   console.log("create");
      // },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onUpdate: async ({ editor, transaction }) => {
        if (renderCount < 3) {
          setRenderCount((old) => old + 1);
        } else {
          await updateContent();
          console.log("ur ugly");
        }
      },
    },
    [ydoc]
  );
  useEffect(() => {
    if (isUploading) {
      toast("Uploading image...");
    }
  }, [isUploading]);

  return (
    <div
      onClick={() => {
        editor?.chain().focus().run();
      }}
      className="s relative min-h-[500px] w-full  max-w-screen-lg  p-1"
    >
      <EditorContent editor={editor} />
      {editor ? (
        <>
          <EditorContent editor={editor} id="editor" />
          <EditorBubbleMenu editor={editor} />
        </>
      ) : (
        <></>
      )}
    </div>
  );
};
const TiptapEditorMemo = memo(TiptapEditor);

export default TiptapEditorMemo;
