import Placeholder from "@tiptap/extension-placeholder";
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  JSONContent,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import debounce from "lodash.debounce";
import * as pako from "pako";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import FileExtension from "./FileExtension";
import ImageExtension from "./ImageExtension";

const TiptapEditor = (props: {
  id: string;
  content: Uint8Array | undefined;
  type: "QUEST" | "SOLUTION" | "POST";
}) => {
  let contentRestored: string | undefined;
  const { id, content, type, setIsSaving } = props;

  if (content) {
    const restored = pako.inflate(content, { to: "string" });

    contentRestored = restored;
  }

  // const provider = new HocuspocusProvider({
  //   url: "ws://0.0.0.0:80",
  //   name: `${quest.id}`,
  //   token: TEST_USER.id,
  //   parameters: { creatorId: TEST_USER.id },
  // });

  // const ydoc = new Y.Doc();
  // new IndexeddbPersistence(`${quest.id}`, ydoc);
  // console.log("ydoc", ydoc);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateContent = useCallback(
    debounce(
      ({
        content,
        textContent,
        type,
      }: {
        content: string;
        textContent: string;
        type: "QUEST" | "SOLUTION";
      }) => {
        //transactionQueue is immutable, but I'll allow myself to mutate the copy of it
        const updateTime = new Date().toISOString();
        const compressedContent = pako.deflate(content);
        const compressedTextContent = pako.deflate(textContent);
      },
      1000
    ),
    []
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        // Image,
        // Image.configure({
        //   // inline: true,
        //   HTMLAttributes: {
        //     class: styles.imageContainer,
        //   },
        // }),
        ImageExtension,
        FileExtension,
        Placeholder.configure({
          placeholder: "Write something …",
        }),

        // EventHandler,

        // Collaboration.configure({
        //   document: provider.document,
        // }),

        // Collaboration.configure({
        //   document: ydoc,
        // }),
      ],
      // content: JSON.parse(quest.content),
      ...(contentRestored && {
        content: JSON.parse(contentRestored) as JSONContent,
      }),
      // onCreate: () => {
      //   console.log("editor created");
      // },

      onUpdate: ({ editor }) => {
        const json = editor.getJSON();
        const jsonString = JSON.stringify(json);

        // updateQuest();
        // send the content to an API here
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
    async (e: ChangeEvent<HTMLInputElement>) => {
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
    [editor]
  );
  const addFile = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
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
    },
    [editor]
  );
  return (
    <div className="min-h-[200px]">
      {editor && (
        <>
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
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
            <input
              name="image"
              type="file"
              accept="image/*"
              ref={imageInputRef}
              className={styles.imageInput}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onChange={addImage}
            />
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

export default TiptapEditor;
