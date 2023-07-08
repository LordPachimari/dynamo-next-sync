import Image, { ImageLoaderProps } from "next/image";

export default function ImageComponent(props: {
  src: string;
  width: string;
  height: string;
  alt: string;
  title: string;
}) {
  const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  };
  return (
    <div className="flex items-center justify-center">
      <a href={props.src} target="_blank" rel="noopener noreferrer">
        <Image
          width={Math.round(parseInt(props.width))}
          height={Math.round(parseInt(props.height))}
          src={props.src}
          loader={imageLoader}
          alt={props.alt}
          title={props.title}
          sizes="(max-width: 768px) 90vw, (min-width: 1024px) 400px"
        />
      </a>
    </div>
  );
}
