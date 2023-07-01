import { generateHTML } from "@tiptap/html";
import parse, {
  attributesToProps,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";
import Image, { ImageLoaderProps } from "next/image";
import { useMemo } from "react";
import FileExtension from "../Tiptap/extensions/FileExtension";
import ImageExtension from "../Tiptap/extensions/ImageExtension";

import { format } from "date-fns";
import { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import {
  PublishedQuest,
  PublishedSolution,
  Quest,
  Solution,
  TopicsType,
} from "~/types/types";
import { Badge } from "~/ui/Badge";
import { cn } from "~/utils/cn";
import { Gem, Users2 } from "lucide-react";
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
        "bg-green-400": topic === "BUSINESS",
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
          <Badge key={i} className="w-fit bg-blue-400 hover:bg-blue-500">
            {s}
          </Badge>
        ))}
    </div>
  );
};

const Reward = ({ reward }: { reward: number | undefined }) => {
  return (
    <div className="flex gap-2" id="reward">
      <Gem className="text-purple-500" />
      <p className="font-bold text-purple-500">{reward}</p>
    </div>
  );
};
const Slots = ({ slots }: { slots: number | undefined }) => {
  return (
    <div className="flex gap-2" id="slots">
      <Users2 className="text-gray-500" />
      <p className="font-bold text-gray-500">{slots}</p>
    </div>
  );
};
const DateComponent = ({ questDate }: { questDate: string }) => {
  return (
    <div className="flex gap-3">
      <p className="font-bold">Due</p>
      <Badge className="bg-blue-400 hover:bg-blue-500">
        {format(new Date(questDate), "PPP")}
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
    <div className="flex flex-col gap-2">
      {quest.published ? (
        <div className="flex justify-between">
          <Title title={quest.title} />

          <Badge
            className={cn("flex h-8 w-16 justify-center bg-green-500", {
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
      <div className="flex gap-2">
        <Topic topic={quest.topic} />
        <Subtopic subtopic={quest.subtopic} />
      </div>
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
export const NonEditableContent = ({
  content,
}: {
  content: string | JSONContent;
}) => {
  let contentJSON: JSONContent | null = null;
  if (typeof content === "string") {
    contentJSON = JSON.parse(content) as JSONContent;
  } else {
    contentJSON = content;
  }
  const output = useMemo(() => {
    return generateHTML(contentJSON!, [
      StarterKit,
      ImageExtension,
      FileExtension,
    ]);
  }, [contentJSON]);
  console.log("output", output);
  console.log("json content", contentJSON);

  return <>{parse(output, HtmlParseOptions)}</>;
};
