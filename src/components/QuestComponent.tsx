import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { PublishedQuest, TopicsType } from "~/types/types";
import { TopicColor } from "~/utils/topicsColor";
import { Card, CardContent, CardFooter, CardHeader } from "~/ui/Card";
import { format } from "date-fns";
import { Badge } from "~/ui/Badge";
import { cn } from "~/utils/cn";
export default function QuestComponent({
  quest,
  includeContent,
  includeDetails,
}: {
  quest: PublishedQuest;
  includeContent: boolean;
  includeDetails: boolean;
}) {
  return (
    <Card className="h-fit w-full rounded-md">
      <CardHeader>
        <div className="flex flex-wrap gap-5">
          <div className="flex items-center gap-4">
            {quest.username && (
              <Link href={`/profile/${quest.username}`}></Link>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3>{quest.username}</h3>
                <p>{format(new Date(quest.publishedAt), "PPP")}</p>
              </div>

              <Link href={`/quests/${quest.id}`}>
                <div className="flex flex-wrap gap-1">
                  <Badge className="bg-blue-400">
                    <p>{format(new Date(quest.deadline), "PPP")}</p>
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className={TopicColor({ topic: quest.topic })}>
                    {quest.topic}
                  </Badge>
                  {quest.subtopic.map((subtopic, i) => (
                    <Badge className="bg-blue-400" key={i}>
                      {subtopic}
                    </Badge>
                  ))}
                </div>
              </Link>
            </div>
          </div>

          <Badge>{quest.status}</Badge>
        </div>
      </CardHeader>

      <Link href={`/quests/${quest.id}`}>
        <h3>{quest.title}</h3>
        {includeContent && (
          <CardContent className="md:16 h-20 overflow-x-hidden text-ellipsis whitespace-nowrap">
            {quest.text}
          </CardContent>
        )}

        {includeDetails && (
          <CardFooter>
            <span>
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
              <p className="text-purple-500">{quest.reward}</p>
            </span>
            <span>
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
              <p className="text-gray-500">
                {`${quest.solverCount}/${quest.slots}`}
              </p>
            </span>
          </CardFooter>
        )}
      </Link>
    </Card>
  );
}
