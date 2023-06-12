import {
  PublishedQuest,
  PublishedSolution,
  Quest,
  Solution,
  TopicsType,
} from "../../types/main";
import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import _Text from "@tiptap/extension-text";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";

import parse, {
  attributesToProps,
  HTMLReactParserOptions,
  Element,
} from "html-react-parser";
import { useMemo } from "react";
import dayjs from "dayjs";
import { generateHTML } from "@tiptap/html";
import Image, { ImageLoaderProps } from "next/image";
import FileExtension from "../Tiptap/FileExtension";
import ImageExtension from "../Tiptap/ImageExtension";
import * as pako from "pako";

import styles from "./workspace.module.css";
import {
  Badge,
  Box,
  Center,
  Flex,
  Heading,
  HStack,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { FromNow } from "~/utils/dayjs";
import { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
export const HtmlParseOptions: HTMLReactParserOptions = {
  replace: (_domNode) => {
    const domNode = _domNode as Element;

    if (domNode.attribs && domNode.name === "image-component") {
      const props = attributesToProps(domNode.attribs);
      const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
        return `${src}?w=${width}&q=${quality || 75}`;
      };

      return (
        <Center>
          <Image
            width={Math.round(parseInt(props.width!))}
            height={Math.round(parseInt(props.height!))}
            src={props.src!}
            loader={imageLoader}
            alt="image"
            sizes="(max-width: 768px) 90vw, (min-width: 1024px) 400px"
          />
        </Center>
      );
    }

    if (domNode.attribs && domNode.name === "file-component") {
      const props = attributesToProps(domNode.attribs);

      return (
        <div className={styles.fileContainer}>
          <a href={props.link}>{props.src}</a>
        </div>
      );
    }
  },
};
const Title = ({ title }: { title: string | undefined }) => {
  return (
    <Heading as="h2" id="title">
      {title}
    </Heading>
  );
};
const Topic = ({ topic }: { topic?: TopicsType | undefined }) => {
  return (
    <Badge
      colorScheme={`${
        topic === "BUSINESS"
          ? "green"
          : topic === "MARKETING"
          ? "red"
          : topic === "PROGRAMMING"
          ? "purple"
          : topic === "VIDEOGRAPHY"
          ? "blue"
          : topic === "SCIENCE"
          ? "green"
          : "white"
      }`}
      fontSize="sm"
      width="fit-content"
      borderRadius="md"
    >
      {topic && topic}
    </Badge>
  );
};

const Subtopic = ({ subtopic }: { subtopic: string[] | undefined }) => {
  return (
    <Flex id="subtopic" gap={2}>
      {subtopic &&
        subtopic.map((s, i) => (
          <Badge
            key={i}
            colorScheme="blue"
            fontSize="sm"
            width="fit-content"
            borderRadius="md"
          >
            {s}
          </Badge>
        ))}
    </Flex>
  );
};

const Reward = ({ reward }: { reward: number | undefined }) => {
  return (
    <Flex id="reward" gap={2}>
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
      <Text fontWeight="bold" color="purple.500">
        {reward}
      </Text>
    </Flex>
  );
};
const Slots = ({ slots }: { slots: number | undefined }) => {
  return (
    <Flex id="slots" gap={2}>
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
      <Text fontWeight="bold" color="gray.500">
        {slots}
      </Text>
    </Flex>
  );
};
const DateComponent = ({ questDate }: { questDate: string }) => {
  return (
    <Flex gap={3}>
      <Text>DUE</Text>
      <Badge
        colorScheme="blue"
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderRadius="md"
      >
        {FromNow({ date: questDate })}
      </Badge>
      <Badge
        colorScheme="blue"
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderRadius="md"
      >
        {dayjs(questDate).format("MMM D, YYYY")}
      </Badge>
    </Flex>
  );
};

export const NonEditableQuestAttributes = ({
  quest,
}: {
  quest: Quest | PublishedQuest;
}) => {
  const publishedQuest = quest as PublishedQuest;
  return (
    <Flex flexDirection="column" gap={3}>
      {quest.published ? (
        <Flex>
          <Title title={quest.title} />
          <Spacer />
          <Badge
            fontSize="md"
            h="8"
            minW="16"
            variant="solid"
            display="flex"
            alignItems="center"
            justifyContent="center"
            colorScheme="green"
            borderRadius="md"
          >
            {publishedQuest.status}
          </Badge>
        </Flex>
      ) : (
        <Title title={quest.title} />
      )}
      {quest.deadline && <DateComponent questDate={quest.deadline} />}
      <Topic topic={quest.topic} />
      <Subtopic subtopic={quest.subtopic} />
      <Flex gap={2}>
        <Reward reward={quest.reward} />
        <Slots slots={quest.slots} />
      </Flex>
    </Flex>
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
        <Flex>
          <Title title={publishedSolution.title} />
          <Spacer />
          <Badge
            fontSize="md"
            h="8"
            minW="16"
            variant="solid"
            display="flex"
            alignItems="center"
            justifyContent="center"
            colorScheme={
              publishedSolution.status === "ACCEPTED"
                ? "green"
                : publishedSolution.status === "ACKNOWLEDGED"
                ? "green"
                : publishedSolution.status === "REJECTED"
                ? "red"
                : "yellow"
            }
            borderRadius="md"
          >
            {publishedSolution.status || "POSTED"}
          </Badge>
        </Flex>
      ) : (
        <Title title={solution.title} />
      )}
    </>
  );
};
export const NonEditableContent = ({ content }: { content: Uint8Array }) => {
  const restoredContent = pako.inflate(content, { to: "string" });
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
const Preview = ({
  quest,
  solution,
  content,
  type,
}: {
  quest?: Quest;
  content?: Uint8Array;
  solution?: Solution;
  type: "SOLUTION" | "QUEST";
}) => {
  if (type === "QUEST" && quest) {
    return (
      <>
        <NonEditableQuestAttributes quest={quest} />

        {content && <NonEditableContent content={content} />}
      </>
    );
  }
  if (type === "SOLUTION" && solution) {
    return (
      <>
        <NonEditableSolutionAttributes solution={solution} />
        {content && <NonEditableContent content={content} />}
      </>
    );
  }
  return <>hello</>;
};
export default Preview;
