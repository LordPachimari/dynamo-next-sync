import { TopicsType } from "~/types/types";

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
