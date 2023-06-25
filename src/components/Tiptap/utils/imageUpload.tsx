import { EditorView } from "@tiptap/pm/view";
// import { BlobResult } from "@vercel/blob";
import { toast } from "sonner";
import { ExpandedRouteConfig } from "~/types/file-types";

export const handleImageUpload = ({
  res,
  view,
  event,
}: {
  res:
    | {
        fileUrl: string;
        fileKey: string;
      }[];

  view: EditorView;
  event: ClipboardEvent | DragEvent | React.ChangeEvent<HTMLInputElement>;
}) => {
  console.log("handling image");
  // check if the file is an image
  const insertImage = ({
    fileUrl,
    fileKey,
  }: {
    fileUrl: string;
    fileKey: string;
  }) => {
    console.log("inserting image");
    // for paste events
    if (event instanceof ClipboardEvent) {
      return view.dispatch(
        view.state.tr.replaceSelectionWith(
          view.state.schema.nodes.imageComponent!.create({
            src: fileUrl,
            alt: fileKey,
            title: fileKey,
          })
        )
      );

      // for drag and drop events
    } else if (event instanceof DragEvent) {
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
      const transaction = view.state.tr.insert(coordinates?.pos || 0, node); // places it in the correct position
      return view.dispatch(transaction);

      // for input upload events
    } else if (event instanceof Event) {
      return view.dispatch(
        view.state.tr.replaceSelectionWith(
          view.state.schema.nodes.imageComponent!.create({
            src: fileUrl,
            alt: fileKey,
            title: fileKey,
          })
        )
      );
    }
  };
  for (const { fileKey, fileUrl } of res) {
    insertImage({ fileKey, fileUrl });
  }
};

export const generatePermittedFileTypes = (config?: ExpandedRouteConfig) => {
  const fileTypes = config ? Object.keys(config) : [];

  const maxFileCount = config
    ? Object.values(config).map((v) => v.maxFileCount)
    : [];

  return { fileTypes, multiple: maxFileCount.some((v) => v && v > 1) };
};

export const capitalizeStart = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const INTERNAL_doFormatting = (config?: ExpandedRouteConfig): string => {
  if (!config) return "";

  const allowedTypes = Object.keys(config) as (keyof ExpandedRouteConfig)[];

  const formattedTypes = allowedTypes.map((f) => {
    if (f.includes("/")) return `${f.split("/")[1]!.toUpperCase()} file`;
    return f === "blob" ? "file" : f;
  });

  // Format multi-type uploader label as "Supports videos, images and files";
  if (formattedTypes.length > 1) {
    const lastType = formattedTypes.pop();
    return `${formattedTypes.join("s, ")} and ${lastType!}s`;
  }

  // Single type uploader label
  const key = allowedTypes[0];
  const formattedKey = formattedTypes[0];

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion,
  const { maxFileSize, maxFileCount } = config[key!]!;

  if (maxFileCount && maxFileCount > 1) {
    return `${formattedKey!}s up to ${maxFileSize}, max ${maxFileCount}`;
  } else {
    return `${formattedKey!} (${maxFileSize})`;
  }
};

const allowedContentTextLabelGenerator = (
  config?: ExpandedRouteConfig
): string => {
  return capitalizeStart(INTERNAL_doFormatting(config));
};
