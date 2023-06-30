import { format, formatDistanceToNowStrict } from "date-fns";
import { Gem, Users2 } from "lucide-react";
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
  console.log(TopicColor({ topic: quest.topic }));
  return (
    <Card className="h-fit w-full rounded-xl drop-shadow-md">
      <CardHeader className="flex w-full p-2">
        <div className="flex flex-wrap justify-between gap-5">
          <div className="flex items-center gap-4">
            {quest.publisherUsername && (
              // <Link href={`/profile/${quest.username}`}>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              // </Link>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3>{quest.publisherUsername}</h3>
                <p>
                  {formatDistanceToNowStrict(new Date(quest.publishedAt))} ago
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className={`${TopicColor({ topic: quest.topic })}`}>
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
          <div className="flex flex-wrap gap-2">
            <div className="flex h-8 flex-wrap items-center  gap-1">
              <p>due</p>
              <Badge className="h-6 bg-blue-400">
                <p>{format(new Date(quest.deadline), "PPP")} </p>
              </Badge>
            </div>
            <Badge className="h-6 w-16 justify-center bg-green-400 text-center">
              <p className="text-sm font-bold">{quest.status}</p>
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* <Link href={`/quests/${quest.id}`}> */}
      <CardContent className="md:16 h-30 overflow-x-hidden text-ellipsis whitespace-nowrap p-3">
        <h3 className="text-xl font-extrabold">{quest.title}</h3>
        {includeContent && <p>{quest.text}</p>}
      </CardContent>
      {/* </Link> */}

      {includeDetails && (
        <CardFooter className="flex gap-2 px-3 pb-2">
          <span className="flex gap-2">
            <Gem className="text-purple-500" size={20} />

            <p className="text-purple-500">{quest.reward}</p>
          </span>
          <span className="flex gap-2">
            <Users2 className="text-gray-500" size={22} />
            <p className="text-gray-500">
              {`${quest.solverCount}/${quest.slots}`}
            </p>
          </span>
        </CardFooter>
      )}
    </Card>
  );
}
