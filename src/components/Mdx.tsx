/* eslint-disable @typescript-eslint/ban-ts-comment */
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import { replaceLinks } from "~/utils/remark-plugins";
import ImageComponent from "./Image";

export default function MDX({ source }: { source: MDXRemoteProps }) {
  const components = {
    a: replaceLinks,
    ImageComponent,
  };
  return (
    <article
      className="prose-md prose prose-stone w-full dark:prose-invert sm:prose-lg sm:w-3/4"
      suppressHydrationWarning={true}
    >
      {/* @ts-ignore */}
      <MDXRemote {...source} components={components} />
    </article>
  );
}
