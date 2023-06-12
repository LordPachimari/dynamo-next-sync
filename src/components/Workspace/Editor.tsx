"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Post, Quest, Solution, UpdateQueue, WorkUpdate } from "~/types/types";
import debounce from "lodash.debounce";
import {
  NonEditableContent,
  NonEditableQuestAttributes,
  NonEditableSolutionAttributes,
} from "./NonEditableAttributes";
import TiptapEditor from "./TiptapEditor";
import Publish from "./Publish";
import { Button } from "../../ui/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/AlertDialog";
import QuestAttributes from "./QuestAttibutes";
import SolutionAttributes from "./SolutionAttributes";
// });
const Editor = ({ id }: { id: string }) => {
  const [work, setWork] = useState<
    | (Quest & { status?: "OPEN" | "CLOSED" } & Solution &
        Post & { type: "QUEST" | "SOLUTION" | "POST" })
    | null
    | undefined
  >(undefined);

  const [content, setContent] = useState<Uint8Array>();
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const cancelRef = useRef(null);

  const updateAttributesHandler = useCallback(
    debounce(
      ({
        updateQueue,
        //last transaction needs to be pushed into transactionQueue,
        //as the last addTransaction function is executed in parallel with updateQuestAttributeHandler,
        //and cannot be captured inside of updateQuestAttributeHandler function
        lastUpdate,
      }: {
        updateQueue: UpdateQueue;
        lastUpdate: WorkUpdate;
      }) => {
        //transactionQueue is immutable, but I'll allow myself to mutate the copy of it
        console.log("update...");
        const _updateQueue = structuredClone(updateQueue);
        const update = _updateQueue.get(id);
        if (!update) {
          _updateQueue.set(id, lastUpdate);
        } else {
          const newUpdate = { ...update, lastUpdate };
          _updateQueue.set(id, newUpdate);
        }
      },
      1000
    ),
    []
  );
  const handleUnpublish = () => {};

  return (
    <div className="mb-20 mt-10 flex flex-col items-center justify-center">
      <div className="b w-5/6 max-w-2xl rounded-md bg-white p-5 drop-shadow-lg">
        {work && work.published && work.type === "QUEST" ? (
          <NonEditableQuestAttributes quest={work} />
        ) : work && work.type === "QUEST" ? (
          <QuestAttributes
            quest={work}
            // isLoading={shouldUpdate && serverwork.isLoading}
            updateAttributesHandler={updateAttributesHandler}
          />
        ) : work && work.published && work.type === "SOLUTION" ? (
          <NonEditableSolutionAttributes solution={work} />
        ) : work && work.type === "SOLUTION" ? (
          <SolutionAttributes
            solution={work}
            updateAttributesHandler={updateAttributesHandler}
          />
        ) : (
          <>No work found</>
        )}
        {work && work.published && work.content ? (
          <NonEditableContent content={work.content} />
        ) : work ? (
          <TiptapEditor
            id={work.id}
            content={work.content}
            type={work.type}
            setIsSaving={setIsSaving}
          />
        ) : (
          <></>
        )}
      </div>
      {work && !work.published && (
        <Publish
          workId={id}
          type={}
          isOpen={isOpen}
          onClose={onClose}
          onOpen={onOpen}
          setwork={setwork}
          isSaving={isSaving}
        />
      )}
      {work && work.published && (
        <div className="mt-3 flex gap-5">
          <Button className="w-32 bg-red-500" onClick={onAlertOpen}>
            Unpublish
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Show Dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm your action</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure? All current active solvers will be lost
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Unpusblish</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            className="w-full bg-green-500"
            onClick={() => {
              void router.push(`/works/${work.id}`);
            }}
          >
            View Published work
          </Button>
        </div>
      )}
      {/* <Button
        onClick={() =>
          router.push("/workspace/works/work1", undefined, {
            shallow: "true",
          })
        }
      >
        Check
      </Button> */}
    </div>
  );
};
export default Editor;
