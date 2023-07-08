import { cn } from "./cn";

export const TopicColor = ({ topic }: { topic: string }) => {
  return cn("sm w-fit bg-white", {
    "bg-red-500": topic === "MARKETING",
    "bg-green-500": topic === "BUSINESS" || topic === "SCIENCE",
    "bg-purple-500": topic === "PROGRAMMING",
    "bg-blue-9": topic === "VIDEOGRAPHY",
  });
};
