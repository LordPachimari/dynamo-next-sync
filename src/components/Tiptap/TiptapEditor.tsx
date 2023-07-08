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
import { toast } from "sonner";
import * as Y from "yjs";
import { useUploadThing } from "~/utils/useUploadThing";
import { WorkspaceStore } from "~/zustand/workspace";
import { EditorBubbleMenu } from "./components/BubleMenu";
import { TiptapExtensions } from "./extensions";
import { MergedWork } from "~/types/types";
import Publish from "../Workspace/Publish";
const TiptapEditor = (props: {
  id: string;
  ydoc: Y.Doc;
  work: MergedWork;
  setRenderCount: Dispatch<SetStateAction<number>>;
  renderCount: number;
  isCreator: boolean;
}) => {
  const { id, setRenderCount, renderCount, ydoc, isCreator, work } = props;
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

  console.log("render count", renderCount);

  // const ydoc = useMemo(() => new Y.Doc(), [id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateContent = useCallback(
    debounce(async (textContent?: string) => {
      console.log("updating content", ydoc, rep);
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
          class: "prose-headings:font-sans focus:outline-none",
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
      editable: !work.published,

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onUpdate: async ({ editor, transaction }) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        console.log("markdown", editor.storage.markdown.getMarkdown());
        if (renderCount < 3) {
          setRenderCount((old) => old + 1);
        } else {
          if (!work.published) {
            await updateContent(editor.getText());
          }
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
      className=" relative h-fit w-full  max-w-screen-lg  p-1"
    >
      {editor && (
        <>
          <EditorContent
            editor={editor}
            id="editor"
            className="min-h-[500px] font-default"
          />
          {editor.isEditable && <EditorBubbleMenu editor={editor} />}
        </>
      )}

      {isCreator && editor && !work.published && (
        <Publish work={work} ydoc={ydoc} editor={editor} />
      )}
    </div>
  );
};
const TiptapEditorMemo = memo(TiptapEditor);

export default TiptapEditorMemo;
