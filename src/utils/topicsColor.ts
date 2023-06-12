import { TopicsType } from "~/types/main";

export const TopicColor = ({ topic }: { topic: string }) => {
  if (topic === "BUSINESS") {
    return "green.200";
  }
  if (topic === "PROGRAMMING") {
    return "purple.200";
  }
  if (topic === "MARKETING") {
    return "red.200";
  }
  if (topic === "SCIENCE") {
    return "greenyellow";
  }
  if (topic === "VIDEOGRAPHY") {
    return "blue.200";
  }
  return "white";
};
export const TopicColorScheme = (topic: TopicsType) => {
  if (topic === "MARKETING") {
    return "red";
  } else if (topic === "BUSINESS") {
    return "green";
  } else if (topic === "SCIENCE") {
    return "blue";
  } else if (topic === "PROGRAMMING") {
    return "purple";
  } else if (topic === "VIDEOGRAPHY") {
    return "teal";
  }
};
