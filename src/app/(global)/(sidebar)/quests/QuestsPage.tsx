"use client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useSubscribe } from "replicache-react";
import { classNames } from "uploadthing/client";
import GlobalChat from "~/components/GlobalChat/GlobalChat";
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
  ) as [key: string, value: PublishedQuest & { SK: string }][] | null;
  if (quests) {
    quests.sort(([key, val], [key2, val2]) => {
      if (val.SK > val2.SK) {
        return -1;
      } else if (val.SK < val2.SK) {
        return 1;
      }
      return 0;
    });
  }
  return (
    <div className="top-0 mb-20 mt-20 flex w-full justify-center ">
      <div className="flex w-11/12 justify-center">
        <div className="flex w-full max-w-3xl flex-col gap-3 lg:w-7/12">
          <div className="flex w-full flex-row-reverse">
            {showChat ? (
              <GlobalChat setShowChat={setShowChat} />
            ) : (
              <Button
                className="w-25 fixed bottom-10 right-[50px] z-40 bg-blue-9 text-white hover:bg-blue-10"
                onClick={() => setShowChat((old) => !old)}
              >
                <MessageCircle size={28} className="text-color-white pr-2" />
                Global
              </Button>
            )}

            <Select
            // onValueChange={async (value) => {
            //   await handleTopicChange(value as Topic);
            //   setTopicState(value as Topic);
            // }}
            // value={topicState}
            >
              <SelectTrigger className="w-[180px] bg-white dark:border-slate-6 dark:bg-slate-3 dark:outline-blue-6">
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
          </div>
        </div>
        <div className=" sticky top-20 hidden h-screen w-80 flex-col gap-10 pl-10 lg:flex"></div>
      </div>
    </div>
  );
}
