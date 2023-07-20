import { format } from "date-fns";
import { Gem, Users2 } from "lucide-react";
import {
  PublishedQuest,
  PublishedSolution,
  Quest,
  Solution,
  Topic,
} from "~/types/types";
import { Badge } from "~/ui/Badge";
import { cn } from "~/utils/cn";
const Title = ({ title }: { title: string | undefined }) => {
  return (
    <h1 className="2xl font-extrabold" id="title">
      {title}
    </h1>
  );
};
const Topic = ({ topic }: { topic?: Topic | undefined }) => {
  return (
    <Badge
      className={cn("sm w-fit bg-white", {
        "bg-red-500": topic === "MARKETING",
        "bg-green-400": topic === "BUSINESS",
        "bg-purple-500": topic === "PROGRAMMING",
        "bg-blue-9": topic === "VIDEOGRAPHY",
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
          <Badge key={i} className="w-fit bg-blue-9 hover:bg-blue-10">
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
const Slots = ({
  slots,
  solversCount,
}: {
  slots: number | undefined;
  solversCount: number | undefined;
}) => {
  return (
    <div className="flex gap-2" id="slots">
      <Users2 className="text-gray-500 dark:text-slate-100" />
      <p className="font-bold text-slate-500 dark:text-slate-100">
        {slots ? `${solversCount || 0}/${slots}` : slots}
      </p>
    </div>
  );
};
const DateComponent = ({ questDate }: { questDate: string }) => {
  return (
    <div className="flex gap-3">
      <p className="font-bold">Due</p>
      <Badge className="bg-blue-9 hover:bg-blue-10">
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
        <Slots
          slots={quest.slots}
          solversCount={
            quest.published ? (quest as PublishedQuest).solversCount : undefined
          }
        />
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
