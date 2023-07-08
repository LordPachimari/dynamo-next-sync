import { format, formatDistanceToNowStrict } from "date-fns";
import { Gem, Users2 } from "lucide-react";
import Link from "next/link";
import { PublishedQuest } from "~/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/Avatar";
import { Badge } from "~/ui/Badge";
import { Card, CardContent, CardFooter, CardHeader } from "~/ui/Card";
import { TopicColor } from "~/utils/topicsColor";
export default function QuestComponent({
  quest,
  includeContent,
  includeDetails,
}: {
  quest: PublishedQuest;
  includeContent: boolean;
  includeDetails: boolean;
}) {
  console.log("qust username", quest);

  return (
    <Card className="h-fit w-full rounded-xl bg-white drop-shadow-sm dark:border-[1px] dark:border-slate-6 dark:bg-slate-3">
      <CardHeader className="flex w-full p-2">
        <div className="flex w-full justify-between gap-5">
          <div className="flex w-full items-center gap-4">
            {quest.publisherUsername && (
              // <Link href={`/profile/${quest.username}`}>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              // </Link>
            )}

            <div className="w-full">
              <div className="flex w-full items-center justify-between gap-2">
                <div className=" flex flex-wrap items-center gap-2">
                  <p className="text-lg font-extrabold">
                    {quest.publisherUsername}
                  </p>
                  <p className="font-bold opacity-70">
                    {formatDistanceToNowStrict(new Date(quest.publishedAt))} ago
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="flex h-8  items-center gap-1">
                    <p>due</p>
                    <Badge className="h-6 w-28 bg-blue-400">
                      <p>{format(new Date(quest.deadline), "PPP")} </p>
                    </Badge>
                    <Badge className="h-6 w-16 justify-center bg-green-400 text-center">
                      <p className="text-sm font-bold">{quest.status}</p>
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge className={TopicColor({ topic: quest.topic })}>
                  {quest.topic}
                </Badge>
                {quest.subtopic.map((subtopic, i) => (
                  <Badge className="bg-blue-400" key={i}>
                    {subtopic}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <Link href={`/quests/${quest.id}`}>
        <CardContent className="md:16 h-30 max-h-[200px] min-h-[100px] overflow-x-hidden text-ellipsis whitespace-nowrap p-3">
          <h3 className="font-default  text-xl font-bold dark:text-white">
            {quest.title}
          </h3>
          {includeContent && (
            <p className="font-default ">{quest.textContent}</p>
          )}
        </CardContent>
      </Link>

      {includeDetails && (
        <CardFooter className="flex gap-2 border-t-2 px-3 pb-2 pt-2  dark:border-slate-6">
          <span className="flex gap-2">
            <Gem className="text-purple-9" size={20} />

            <p className="text-purple-9">{quest.reward}</p>
          </span>

          <span className="flex gap-2">
            <Users2 className="text-slate-500 dark:text-slate-100" size={22} />
            <p className="text-slate-500 dark:text-slate-100">{`${quest.solversCount}/${quest.slots}`}</p>
          </span>
        </CardFooter>
      )}
    </Card>
  );
}
