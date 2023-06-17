import * as Toolbar from "@radix-ui/react-toolbar";
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
import { Bold, Italic, Strikethrough } from "lucide-react";
import * as lz from "lz-string";
import { ChangeEvent, useCallback, useRef } from "react";
import { cn } from "~/utils/cn";
import FileExtension from "./FileExtension";
import ImageExtension from "./ImageExtension";
import { Button } from "~/ui/Button";
import { Image } from "lucide-react";
import { Replicache } from "replicache";
import { M } from "~/repl/mutators";

const TiptapEditor = (props: {
  id: string;
  content: string | undefined;
  type: "QUEST" | "SOLUTION" | "POST";
  rep: Replicache<M> | null;
}) => {
  let contentRestored: string | undefined;
  const { id, content, type, rep } = props;

  if (content) {
    const restored = lz.decompressFromBase64(content);
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
      async ({
        content,
        textContent,
        type,
      }: {
        content: string;
        textContent: string;
        type: "QUEST" | "SOLUTION" | "POST";
      }) => {
        //transactionQueue is immutable, but I'll allow myself to mutate the copy of it
        const updateTime = new Date().toISOString();
        const compressedContent = lz.compressToBase64(content);
        const compressedTextContent = lz.compressToBase64(textContent);

        if (rep) {
          await rep.mutate.updateContent({
            id,
            content: {
              content: compressedContent,
              textContent: compressedTextContent,
              lastUpdated: updateTime,
            },
          });
        }
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

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onUpdate: async ({ editor }) => {
        console.log("update content");
        const json = editor.getJSON();
        const jsonString = JSON.stringify(json);
        // updateQuest();
        // send the content to an API here
        await updateContent({
          content: jsonString,
          textContent: editor.getText(),
          type,
        });
      },
    },
    [id, content]
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
                <Image />
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

export default TiptapEditor;
