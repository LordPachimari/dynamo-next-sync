import { ArrowLeft, LucideIcon } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import React, { ReactNode } from "react";
import { cn } from "~/utils/cn";

const Benefits = (props: {
  data: {
    title: string;
    image?: StaticImageData;
    bullets: {
      title: string;
      desc: string;

      icon: LucideIcon;
    }[];
  };
  imgPos: "right" | "left";
}) => {
  const { data } = props;
  return (
    <>
      <div className="mb-20 flex flex-wrap lg:flex-nowrap lg:gap-10 ">
        <div
          className={`flex w-full items-center justify-center lg:w-1/2 ${
            props.imgPos === "right" ? "lg:order-1" : ""
          }`}
        >
          <div>
            {data.image && (
              <Image
                src={data.image}
                width="500"
                height="500"
                alt="Benefits"
                className={"object-cover"}
                placeholder="blur"
                blurDataURL={data.image.src}
              />
            )}
          </div>
        </div>

        <div
          className={cn("flex w-full flex-wrap items-center lg:w-1/2", {
            "lg:justify-end": props.imgPos === "right",
          })}
        >
          <div>
            <div className="mt-4 flex w-full flex-col">
              <h3 className="mt-3 max-w-2xl text-3xl font-bold leading-snug tracking-tight text-gray-800 dark:text-white lg:text-4xl lg:leading-tight">
                {data.title}
              </h3>
            </div>

            <div className="mt-5 w-full">
              {data.bullets.map((item, index) => (
                <Benefit key={index} title={item.title} icon={item.icon}>
                  {item.desc}
                </Benefit>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

function Benefit(props: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <>
      <div className="mt-8 flex items-start space-x-3">
        <div className="mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-blue-9 text-white ">
          <props.icon />
        </div>
        <div>
          <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200">
            {props.title}
          </h4>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {props.children}
          </p>
        </div>
      </div>
    </>
  );
}

export default Benefits;
