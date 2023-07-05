"use client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useSubscribe } from "replicache-react";
import { classNames } from "uploadthing/client";
import QuestComponent from "~/components/QuestComponent";
import { PublishedQuest, Quest } from "~/types/types";
import { Button } from "~/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/Select";
import { ReplicacheInstancesStore } from "~/zustand/rep";
const date = new Date().toISOString();

// const quests: PublishedQuest[] = [
//   {
//     id: "quest1",
//     creatorId: "user1",
//     deadline: date,
//     lastUpdated: date,
//     published: true,
//     publishedAt: date,
//     publisherUsername: "pachimari",
//     reward: 10,
//     slots: 10,
//     solverCount: 0,
//     status: "OPEN",
//     subtopic: ["LOGO"],
//     textContent: "Hello world",
//     title: "Hello world",
//     topic: "BUSINESS",
//     type: "QUEST",
//     version: 1,
//     collaborators: [],
//   },
// ];
export default function Quests() {
  const [showChat, setShowChat] = useState(false);
  const rep = ReplicacheInstancesStore((state) => state.publishedQuestsRep);
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  const quests = useSubscribe(
    rep,
    async (tx) => {
      const quests = (await tx
        .scan({ prefix: "WORK#QUEST" })
        .entries()
        .toArray()) as [key: string, value: PublishedQuest][];

      console.log("quests", quests);
      return quests;
    },
    null,
    []
  ) as [key: string, value: PublishedQuest][] | null;
  return (
    <div className="top-0 mb-20 mt-20 flex w-full justify-center ">
      <div className="flex w-11/12 justify-center">
        <div className="flex w-full flex-col gap-3 lg:w-3/6 ">
          <div className="flex w-full flex-row-reverse">
            {showChat ? (
              <></>
            ) : (
              // <GlobalChat setShowChat={setShowChat} />
              <Button className="w-25 fixed bottom-10 right-[150px] z-40 bg-blue-500 hover:bg-blue-600 ">
                {/* <MessageCircle size={28} className="text-color-white pr-2" /> */}
                Global chat
              </Button>
            )}

            <Select
            // onValueChange={async (value) => {
            //   await handleTopicChange(value as TopicsType);
            //   setTopicState(value as TopicsType);
            // }}
            // value={topicState}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                {/* {Topics.map((t, i) => (
            <SelectItem value={t} key={i}>
              {t}
            </SelectItem>
          ))} */}
              </SelectContent>
            </Select>
          </div>

          {/* <SearchQuestInput
              initialPages={
                serverQuests.data ? serverQuests.data.pages : undefined
              }
              setPages={setPages}
              setSearchLoading={setSearchLoading}
            /> */}

          <div className="flex flex-col gap-3" ref={parent}>
            {quests &&
              quests.map(([key, value]) => {
                return (
                  <QuestComponent
                    key={key}
                    // key={quest.id}
                    quest={value}
                    includeContent={true}
                    includeDetails={true}
                  />
                );
              })}
            {/* {quests &&
              quests.map((q) => {
                return (
                  <QuestComponent
                    key={q.id}
                    // key={quest.id}
                    quest={q}
                    includeContent={true}
                    includeDetails={true}
                  />
                );
              })} */}
          </div>
        </div>
        <div className=" sticky top-20 hidden h-screen w-80 flex-col gap-10 pl-10 lg:flex">
          {/* <Leaderboard /> */}
        </div>
      </div>
    </div>
  );
}
