import { MDXRemoteProps } from "next-mdx-remote";
import MDX from "../Mdx";

const NonEditableContent = ({ mdxSource }: { mdxSource: MDXRemoteProps }) => {
  return <MDX source={mdxSource} />;
};
export default NonEditableContent;
