import { generateHTML } from "@tiptap/html";
import dayjs from "dayjs";
import parse, {
  attributesToProps,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";
import Image, { ImageLoaderProps } from "next/image";
import { useMemo } from "react";
import FileExtension from "../Tiptap/FileExtension";
import ImageExtension from "../Tiptap/ImageExtension";

import { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { FromNow } from "~/utils/dayjs";
import {
  PublishedQuest,
  PublishedSolution,
  Quest,
  Solution,
  TopicsType,
} from "~/types/types";
import { Badge } from "~/ui/Badge";
import { cn } from "~/utils/cn";
import * as lz from "lz-string";
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
            alt="image"
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
const Title = ({ title }: { title: string | undefined }) => {
  return (
    <h1 className="2xl font-extrabold" id="title">
      {title}
    </h1>
  );
};
const Topic = ({ topic }: { topic?: TopicsType | undefined }) => {
  return (
    <Badge
      className={cn("sm w-fit bg-white", {
        "bg-red-500": topic === "MARKETING",
        "bg-green-300": topic === "BUSINESS",
        "bg-purple-500": topic === "PROGRAMMING",
        "bg-blue-500": topic === "VIDEOGRAPHY",
        "bg-green-500": topic === "SCIENCE",
      })}
    >
      {topic && topic}
    </Badge>
  );
};

const Subtopic = ({ subtopic }: { subtopic: string[] | undefined }) => {
  return (
    <div className="flex gap-2" id="subtopic">
      {subtopic &&
        subtopic.map((s, i) => (
          <Badge key={i} className="w-fit bg-blue-300">
            {s}
          </Badge>
        ))}
    </div>
  );
};

const Reward = ({ reward }: { reward: number | undefined }) => {
  return (
    <div className="flex gap-2" id="reward">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
      >
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          d="M4.873 3h14.254a1 1 0 0 1 .809.412l3.823 5.256a.5.5 0 0 1-.037.633L12.367 21.602a.5.5 0 0 1-.706.028c-.007-.006-3.8-4.115-11.383-12.329a.5.5 0 0 1-.037-.633l3.823-5.256A1 1 0 0 1 4.873 3zm.51 2l-2.8 3.85L12 19.05 21.417 8.85 18.617 5H5.383z"
          fill="var(--purple)"
        />
      </svg>
      <p className="font-bold text-purple-500">{reward}</p>
    </div>
  );
};
const Slots = ({ slots }: { slots: number | undefined }) => {
  return (
    <div className="flex gap-2" id="slots">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
      >
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          d="M2 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm8.284 3.703A8.002 8.002 0 0 1 23 22h-2a6.001 6.001 0 0 0-3.537-5.473l.82-1.824zm-.688-11.29A5.5 5.5 0 0 1 21 8.5a5.499 5.499 0 0 1-5 5.478v-2.013a3.5 3.5 0 0 0 1.041-6.609l.555-1.943z"
          fill="var(--gray)"
        />
      </svg>
      <p className="font-bold text-gray-500">{slots}</p>
    </div>
  );
};
const DateComponent = ({ questDate }: { questDate: string }) => {
  return (
    <div className="flex gap-3">
      <p>DUE</p>
      <Badge className="bg-blue-300">{FromNow({ date: questDate })}</Badge>
      <Badge className="bg-blue-300">
        {dayjs(questDate).format("MMM D, YYYY")}
      </Badge>
    </div>
  );
};

export const NonEditableQuestAttributes = ({
  quest,
}: {
  quest: Quest | PublishedQuest;
}) => {
  const publishedQuest = quest as PublishedQuest;
  return (
    <div className="flex flex-col gap-3">
      {quest.published ? (
        <div className="flex justify-between">
          <h1 title={quest.title} />

          <Badge
            className={cn("bg-green-500", {
              "bg-red-500": publishedQuest.status === "CLOSED",
            })}
          >
            {publishedQuest.status}
          </Badge>
        </div>
      ) : (
        <Title title={quest.title} />
      )}
      {quest.deadline && <DateComponent questDate={quest.deadline} />}
      <Topic topic={quest.topic} />
      <Subtopic subtopic={quest.subtopic} />
      <div className="flex gap-2">
        <Reward reward={quest.reward} />
        <Slots slots={quest.slots} />
      </div>
    </div>
  );
};
export const NonEditableSolutionAttributes = ({
  solution,
}: {
  solution: Solution | PublishedSolution;
}) => {
  const publishedSolution = solution as PublishedSolution;
  return (
    <>
      {solution.published ? (
        <div className="flex justify-between">
          <Title title={publishedSolution.title} />
          <Badge
            className={cn("bg-yellow-500", {
              "bg-green-500": publishedSolution.status === "ACCEPTED",
              "bg-green-400": publishedSolution.status === "ACKNOWLEDGED",
              "bg-red-500": publishedSolution.status === "REJECTED",
            })}
          >
            {publishedSolution.status || "POSTED"}
          </Badge>
        </div>
      ) : (
        <Title title={solution.title} />
      )}
    </>
  );
};
export const NonEditableContent = ({ content }: { content: string }) => {
  const restoredContent = lz.decompressFromBase64(content);
  const contentJSON = JSON.parse(restoredContent) as JSONContent;
  const output = useMemo(() => {
    return generateHTML(contentJSON, [
      StarterKit,

      ImageExtension,
      FileExtension,
    ]);
  }, [contentJSON]);

  return <>{parse(output, HtmlParseOptions)}</>;
};
