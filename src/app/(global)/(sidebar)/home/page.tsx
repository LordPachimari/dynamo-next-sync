"use client";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { classNames } from "uploadthing/client";
import QuestComponent from "~/components/QuestComponent";
import { PublishedQuest } from "~/types/types";
import { Button } from "~/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/Select";
const quest: PublishedQuest = {
  id: "quest1",
  creatorId: "user1",
  deadline: "2023-05-25T05:33:09.961Z",
  lastUpdated: "2023-05-25T05:33:09.961Z",
  published: true,
  publishedAt: "2023-05-25T05:33:09.961Z",
  reward: 10,
  slots: 10,
  solverCount: 10,
  status: "OPEN",
  subtopic: ["shit"],
  text: "hi",
  title: "hello world",
  topic: "MARKETING",
  type: "QUEST",
  username: "Pachimari",
};
export default function Home() {
  const [showChat, setShowChat] = useState(false);
  return (
    <div className="top-0 mb-20 mt-20 flex w-full justify-center ">
      <div className="flex w-11/12 justify-center">
        <div className="flex w-full flex-col gap-3 lg:w-3/6 ">
          <div className="flex w-full flex-row-reverse">
            {showChat ? (
              <></>
            ) : (
              // <GlobalChat setShowChat={setShowChat} />
              <Button className="w-25 fixed bottom-10 right-[150px] z-40 bg-orange-400 hover:bg-orange-500 ">
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

          <div className="flex flex-col gap-3">
            <QuestComponent
              // key={quest.id}
              quest={quest}
              includeContent={true}
              includeDetails={true}
            />
          </div>
        </div>
        <div className=" sticky top-20 hidden h-screen w-80 flex-col gap-10 pl-10 lg:flex">
          {/* <Leaderboard /> */}
        </div>
      </div>
    </div>
  );
}
