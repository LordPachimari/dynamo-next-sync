import { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { useMemo } from "react";
import ImageExtension from "../Tiptap/extensions/ImageExtension";
import FileExtension from "../Tiptap/extensions/FileExtension";
import parse, {
  attributesToProps,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";
import Image, { ImageLoaderProps } from "next/image";
import { MDXRemoteProps } from "next-mdx-remote";
import MDX from "../Mdx";
export const HtmlParseOptions: HTMLReactParserOptions = {
  replace: (_domNode) => {
    const domNode = _domNode as Element;

    if (domNode.attribs && domNode.name === "image-component") {
      const props = attributesToProps(domNode.attribs);
      const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
        return `${src}?w=${width}&q=${quality || 75}`;
      };

      return (
        <div className="flex items-center justify-center">
          <Image
            width={Math.round(parseInt(props.width!))}
            height={Math.round(parseInt(props.height!))}
            src={props.src!}
            loader={imageLoader}
            alt={props.alt!}
            sizes="(max-width: 768px) 90vw, (min-width: 1024px) 400px"
          />
        </div>
      );
    }

    if (domNode.attribs && domNode.name === "file-component") {
      const props = attributesToProps(domNode.attribs);

      return (
        <div>
          <a href={props.link}>{props.src}</a>
        </div>
      );
    }
  },
};
const NonEditableContent = ({ mdxSource }: { mdxSource: MDXRemoteProps }) => {
  return <MDX source={mdxSource} />;
};
export default NonEditableContent;
