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
import { MergedWork, User } from "~/types/types";
import Publish from "../Workspace/Publish";

import YPartyKitProvider from "y-partykit/provider";
import {
  getRandomColor,
  useConnection,
  useConnectionStatus,
} from "./extensions/collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { useAuth } from "@clerk/nextjs";
import { userKey } from "~/repl/client/mutators/user";
import { useSubscribe } from "replicache-react";
import PartySocket from "partysocket";
import { STRANGER } from "~/utils/constants";
import { env } from "~/env.mjs";

const TiptapEditor = (props: {
  id: string;
  ydoc: Y.Doc;
  work: MergedWork;
  isCreator: boolean;
}) => {
  const { id, ydoc, isCreator, work } = props;
  const rep = WorkspaceStore((state) => state.rep);
  const { userId } = useAuth();
  const user = useSubscribe(
    rep,
    async (tx) => {
      if (userId) {
        const user = (await tx.get(userKey(userId))) || null;

        return user;
      }
      return null;
    },

    null,
    []
  ) as User | null;
  const yProviderRef = useRef(
    new YPartyKitProvider(env.NEXT_PUBLIC_YJS_PARTYKIT_URL, id, ydoc, {
      connect: false,
    })
  );

  const yProvider = yProviderRef.current;
  useConnection({ yProvider });
  const connectionStatus = useConnectionStatus({ yProvider });
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
                          view.state.schema.nodes.Imagecomponent!.create({
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

                      const node = schema.nodes.Imagecomponent!.create({
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
        },
      },
      extensions: [
        ...TiptapExtensions,

        Collaboration.configure({
          document: ydoc,
          field: "content",
        }),
        CollaborationCursor.configure({
          provider: yProvider,
          user: {
            name: user ? user.username : "Stranger",
            color: getRandomColor(),
          },
        }),
      ],
      editable: !work.published,
    },
    [id]
  );
  useEffect(() => {
    if (isUploading) {
      toast("Uploading image...");
    }
  }, [isUploading]);

  return (
    <main
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
          <footer className="bottom-8 flex flex-row items-center text-sm">
            {!work.published && (
              <>
                <div
                  className={
                    "before:content-[' '] flex items-center gap-1.5 before:block before:h-2 before:w-2 before:rounded-full before:bg-stone-300 data-[status='connected']:before:bg-emerald-500"
                  }
                  data-status={connectionStatus}
                >
                  {editor && connectionStatus === "connected"
                    ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                      `${editor.storage.collaborationCursor.users.length} user${
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        editor.storage.collaborationCursor.users.length === 1
                          ? ""
                          : "s"
                      } online`
                    : "offline"}
                </div>
              </>
            )}
          </footer>
        </>
      )}

      {editor && !work.published && (
        <Publish
          isAuthorised={isCreator && userId !== STRANGER}
          work={work}
          ydoc={ydoc}
          editor={editor}
        />
      )}
    </main>
  );
};
const TiptapEditorMemo = memo(TiptapEditor);

export default TiptapEditorMemo;
