import Collaboration from "@tiptap/extension-collaboration";
import { EditorContent, useEditor } from "@tiptap/react";
import * as base64 from "base64-js";
import debounce from "lodash.debounce";
import {
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useSubscribe } from "replicache-react";
import { toast } from "sonner";
import * as Y from "yjs";
import { contentKey } from "~/repl/mutators";
import { Content } from "~/types/types";
import { useUploadThing } from "~/utils/useUploadThing";
import { WorkspaceStore } from "~/zustand/workspace";
import { EditorBubbleMenu } from "./components/EditorBubleMenu";
import { TiptapExtensions } from "./extensions";
const TiptapEditor = (props: {
  id: string;
  // ydoc: Y.Doc;
  setRenderCount: Dispatch<SetStateAction<number>>;
  renderCount: number;
}) => {
  const { id, setRenderCount, renderCount } = props;
  const rep = WorkspaceStore((state) => state.rep);
  const ydocRef = useRef(new Y.Doc());
  const ydoc = ydocRef.current;
  const Ydoc = useSubscribe(
    rep,
    async (tx) => {
      const content = (await tx.get(contentKey(id))) as Content;
      console.log(content);
      if (content && content.Ydoc) {
        if (content.textContent) {
          console.log("text", content.textContent);
        }
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
    [id]
  );

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

  console.log("render count", renderCount);

  // const ydoc = useMemo(() => new Y.Doc(), [id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateContent = useCallback(
    debounce(async (textContent?: string) => {
      console.log("update", ydoc, rep);
      if (ydoc) {
        const update = Y.encodeStateAsUpdateV2(ydoc);
        if (rep) {
          console.log("mutating", base64.fromByteArray(update));
          // await Promise.all([
          await rep.mutate.updateContent({
            id,
            update: {
              Ydoc: base64.fromByteArray(update),
              ...(textContent && { textContent }),
            },
          });
          // ]);
        }
      }
    }, 1000),
    [id, ydoc]
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
          await updateContent(editor.getText());
          console.log("ur ugly");
        }
      },
    },
    [id]
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
