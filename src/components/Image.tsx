import Image, { ImageLoaderProps } from "next/image";

export default function ImageComponent(props: any) {
  console.log("IMAGE PROPS FROM MDX", props);

  return <div className="flex items-center justify-center"></div>;
}
