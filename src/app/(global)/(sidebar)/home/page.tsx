import { useState } from "react";
import { classNames } from "uploadthing/client";
import { Button } from "~/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/Select";
export default function Home() {
  const [showChat, setShowChat] = useState(false);
  return (
    <div className="sticky top-0 mb-20 mt-20 flex w-full justify-center">
      <div className="flex w-11/12 justify-center">
        <div className="flex w-full flex-col gap-3 lg:w-3/6">
          <div className="flex w-full flex-row-reverse">
            {showChat ? (
              <></>
            ) : (
              // <GlobalChat setShowChat={setShowChat} />
              <Button></Button>
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
            {/*             
                      <QuestComponent
                        key={quest.id}
                        quest={quest}
                        includeContent={true}
                        includeDetails={true}
                      /> */}
          </div>
        </div>
        <div className=" sticky top-20 hidden h-screen w-10/12 flex-col gap-10 pl-10 lg:flex">
          {/* <Leaderboard /> */}
        </div>
      </div>
    </div>
  );
}
