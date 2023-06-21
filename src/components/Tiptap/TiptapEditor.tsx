import * as Toolbar from "@radix-ui/react-toolbar";
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor,
} from "@tiptap/react";
import debounce from "lodash.debounce";
import { Bold, Image as ImageIcon, Italic, Strikethrough } from "lucide-react";
import { ChangeEvent, memo, useCallback, useRef } from "react";
import * as Y from "yjs";
import { Button } from "~/ui/Button";
import { cn } from "~/utils/cn";
import { TiptapExtensions } from "./extensions";
import Collaboration from "@tiptap/extension-collaboration";
import { useSubscribe } from "replicache-react";
import { WorkspaceStore } from "~/zustand/workspace";
import { YJSKey, editorKey } from "~/repl/mutators";
import * as base64 from "base64-js";
const TiptapEditor = (props: {
  id: string;
  //  content: string | undefined
}) => {
  let contentRestored: string | undefined;
  const { id } = props;
  const rep = WorkspaceStore((state) => state.rep);

  const ydocRef = useRef(new Y.Doc());
  const ydoc = ydocRef.current;

  const docStateFromReplicache = useSubscribe(
    rep,
    async (tx) => {
      const v = await tx.get(YJSKey(id));
      if (typeof v === "string") {
        return v;
      }
      return null;
    },
    null,
    [id]
  );
  if (docStateFromReplicache !== null) {
    const update = base64.toByteArray(docStateFromReplicache);
    Y.applyUpdateV2(ydoc, update);
  }

  const updateContent = useCallback(
    debounce(async () => {
      console.log("update");
      const updateTime = new Date().toISOString();

      const update = Y.encodeStateAsUpdateV2(ydoc);
      if (rep) {
        await Promise.all([
          await rep.mutate.updateYJS({
            key: id,
            update: { Ydoc: base64.fromByteArray(update) },
          }),
        ]);
      }
    }, 1000),
    []
  );

  const editor = useEditor(
    {
      extensions: [
        ...TiptapExtensions,
        // Collaboration.configure({
        //   document: provider.document,
        // }),
        Collaboration.configure({
          document: ydoc,
        }),
        // TiptapCursor.configure({
        //   provider,
        // }),
      ],

      // content: JSON.parse(quest.content),
      // ...(contentRestored && {
      //   content: JSON.parse(contentRestored) as JSONContent,
      // }),

      content:
        // contentRestored
        // ? (JSON.parse(contentRestored) as JSONContent)
        // :
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `<title-component id=${id} ></title-component>
        <select-component id=${id} ></select-component>
        <subtopic-component id=${id} ></subtopic-component>
        <reward-component id=${id} ></reward-component>
        <date-component id=${id} ></date-component>
        <p></p>`,

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onUpdate: async ({ editor }) => {
        // updateQuest();
        // send the content to an API here
        await updateContent();
      },
    },
    [id]
  );

  const imageInputRef = useRef<HTMLInputElement>(null);

  const imageInputClick = () => {
    imageInputRef.current?.click();
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileInputClick = () => {
    fileInputRef.current?.click();
  };
  const addImage = useCallback(
    // async
    (e: ChangeEvent<HTMLInputElement>) => {
      // const files = e.target.files;
      // if (!files) {
      //   return;
      // }
      // const file = files[0];
      // if (!file) {
      //   return;
      // }
      // const filename = encodeURIComponent(file.name);
      // const fileType = encodeURIComponent(file.type);
      // const res = await fetch(
      //   `/api/upload-image?file=${filename}&fileType=${fileType}`
      // );

      // const { url, fields } = (await res.json()) as PresignedPost;
      // const formData = new FormData();
      // Object.entries({ ...fields, file }).forEach(([key, value]) => {
      //   formData.append(key, value);
      // });

      // const upload = await fetch(url, {
      //   method: "POST",

      //   body: formData,
      // });
      // if (upload.ok) {
      //   console.log("Uploaded successfully!");
      // } else {
      //   console.log("upload failed", upload.status, upload.statusText);
      // }

      // if (url && editor) {
      //   const imageUrl = new URL(`${url}${fields.key}`);
      //   editor
      //     .chain()
      //     .focus()
      //     // .setImage({ src: `${imageUrl}` })
      //     .insertContent(
      //       `<image-component src=${imageUrl}></image-component><p></p>`
      //     )

      //     .run();
      // }
      e.target.value = "";
    },
    []
  );
  const addFile = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    // const files = e.target.files;
    // if (!files) {
    //   return;
    // }
    // const file = files[0];
    // if (!file) {
    //   return;
    // }
    // const filename = encodeURIComponent(file.name);
    // const fileType = encodeURIComponent(file.type);
    // const res = await fetch(
    //   `/api/upload-file?file=${filename}&fileType=${fileType}`
    // );
    // const { url, fields } = (await res.json()) as PresignedPost;
    // const formData = new FormData();
    // Object.entries({ ...fields, file }).forEach(([key, value]) => {
    //   formData.append(key, value);
    // });
    // const upload = await fetch(url, {
    //   method: "POST",
    //   body: formData,
    // });
    // const fileUrl = new URL(`${url}${fields.key}`);
    // if (upload.ok) {
    //   console.log("Uploaded successfully!");
    //   if (url && editor) {
    //     console.log("hello from the underworld image");
    //     editor
    //       .chain()
    //       .focus()
    //       .insertContent(
    //         `<file-component link=${fileUrl} src=${fields.key}></file-component><p></p>`
    //       )
    //       .run();
    //   }
    // } else {
    //   console.log("upload failed", upload.statusText);
    // }
    // e.target.value = "";
  }, []);
  return (
    <div className="min-h-[500px]">
      {editor && (
        <>
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <Toolbar.Root
              className=" flex w-full min-w-max items-center rounded-md bg-white p-1 shadow-[0_0px_2px]"
              aria-label="Formatting options"
            >
              <Toolbar.ToggleGroup type="multiple" aria-label="Text formatting">
                <Toolbar.ToggleItem
                  className={cn(
                    "text-black-500 ml-0.5 inline-flex h-[25px] flex-shrink-0 flex-grow-0 basis-auto items-center justify-center rounded bg-white px-[5px] text-[13px] leading-none outline-none first:ml-0 hover:bg-orange-100 hover:text-orange-400 focus:relative focus:shadow-[0_0_0_1px] focus:shadow-orange-500 ",
                    {
                      "bg-orange-100": editor.isActive("bold"),
                      "text-orange-400": editor.isActive("bold"),
                    }
                  )}
                  value="bold"
                  aria-label="Bold"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <Bold
                    size={16}
                    className={cn("", {
                      "hover:text-orange-500": editor.isActive("bold"),
                    })}
                  />
                </Toolbar.ToggleItem>
                <Toolbar.ToggleItem
                  className={cn(
                    "text-black-500 ml-0.5 inline-flex h-[25px] flex-shrink-0 flex-grow-0 basis-auto items-center justify-center rounded bg-white px-[5px] text-[13px] leading-none outline-none first:ml-0 hover:bg-orange-100 hover:text-orange-400 focus:relative focus:shadow-[0_0_0_1px] focus:shadow-orange-500 ",
                    {
                      "bg-orange-100": editor.isActive("italic"),
                      "text-orange-400": editor.isActive("italic"),
                    }
                  )}
                  value="italic"
                  aria-label="Italic"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <Italic size={16} className="hover:text-orange-500" />
                </Toolbar.ToggleItem>
                <Toolbar.ToggleItem
                  value="strikethrough"
                  aria-label="Strike through"
                  className={cn(
                    "text-black-500 ml-0.5 inline-flex h-[25px] flex-shrink-0 flex-grow-0 basis-auto items-center justify-center rounded bg-white px-[5px] text-[13px] leading-none outline-none first:ml-0 hover:bg-orange-100 hover:text-orange-400 focus:relative focus:shadow-[0_0_0_1px] focus:shadow-orange-500 ",
                    {
                      "bg-orange-100": editor.isActive("strike"),
                      "text-orange-400": editor.isActive("strike"),
                    }
                  )}
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                  <Strikethrough size={16} className="hover:text-orange-500" />
                </Toolbar.ToggleItem>
              </Toolbar.ToggleGroup>
              <Toolbar.Separator className="bg-mauve6 mx-[10px] w-[1px]" />

              <Toolbar.Separator className="bg-mauve6 mx-[10px] w-[1px]" />
            </Toolbar.Root>

            {/* <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={`${styles.bubbleMenuButton} ${
                editor.isActive("heading", { level: 1 }) ? styles.active : null
              }`}
            >
              h1
            </button>

            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`${styles.bubbleMenuButton} ${
                editor.isActive("bold") ? styles.active : null
              }`}
            >
              bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`${styles.bubbleMenuButton} ${
                editor.isActive("italic") ? styles.active : null
              }`}
            >
              italic
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`${styles.bubbleMenuButton} ${
                editor.isActive("strike") ? styles.active : null
              }`}
            >
              strike
            </button> */}
          </BubbleMenu>

          <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="mt-16 flex gap-2">
              <Button
                variant={"outline"}
                className="border-gray-500 hover:border-orange-300 hover:bg-orange-100"
              >
                h1
              </Button>
              <Button
                variant={"outline"}
                className="flex justify-around border-gray-500 hover:border-orange-300 hover:bg-orange-100"
                onClick={imageInputClick}
              >
                <ImageIcon />
                Image
              </Button>
              <input
                className="hidden"
                name="image"
                type="file"
                accept="image/*"
                ref={imageInputRef}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onChange={addImage}
              />
            </div>

            {/* <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={styles.floatingMenuButton}
            >
              h1
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={styles.floatingMenuButton}
            >
              h2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={styles.floatingMenuButton}
            >
              bullet list
            </button>
            <button
              className={styles.floatingMenuButton}
              onClick={imageInputClick}
            >
              image
            </button>
        
            <button
              className={styles.floatingMenuButton}
              onClick={fileInputClick}
            >
              File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className={styles.imageInput}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onChange={addFile}
            /> */}
          </FloatingMenu>
        </>
      )}

      <EditorContent editor={editor} id="editor" />
    </div>
  );
};
const TiptapEditorMemo = memo(TiptapEditor);

export default TiptapEditorMemo;
