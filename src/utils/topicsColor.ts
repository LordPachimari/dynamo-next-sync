import { cn } from "./cn";

export const TopicColor = ({ topic }: { topic: string | undefined }) => {
  return cn(`sm w-fit bg-white `, {
    "bg-red-9": topic === "MARKETING",
    "bg-green-500 text-white": topic === "BUSINESS" || topic === "SCIENCE",
    "bg-purple-9": topic === "PROGRAMMING",
    "bg-blue-9": topic === "VIDEOGRAPHY",
  });
};
