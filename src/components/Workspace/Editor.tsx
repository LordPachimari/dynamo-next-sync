"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Content,
  MergedWorkType,
  Post,
  Quest,
  Solution,
  UpdateQueue,
  WorkUpdates,
} from "~/types/types";
import debounce from "lodash.debounce";
import {
  NonEditableContent,
  NonEditableQuestAttributes,
  NonEditableSolutionAttributes,
} from "./NonEditableAttributes";
import TiptapEditor from "../Tiptap/TiptapEditor";
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
import { Replicache } from "replicache";
import { M, mutators } from "~/repl/mutators";
import { env } from "~/env.mjs";
import { useSubscribe } from "replicache-react";
// });

const Editor = ({ id, rep }: { id: string; rep: Replicache<M> | null }) => {
  console.log("id from editor", id);
  const work = useSubscribe(
    rep,
    async (tx) => {
      console.log("id from subscribe", id);
      const editor = (await tx.get(`EDITOR#${id}`)) || null;

      return editor;
    },
    null,
    [id]
  ) as MergedWorkType;
  const content = useSubscribe(
    rep,
    async (tx) => {
      const c = (await tx.get(`CONTENT#${id}`)) || null;

      return c;
    },
    null,
    [id]
  ) as { content: string; text: string } | undefined;
  console.log("content", content);
  console.log("work", work);
  console.log("rep", rep);
  const router = useRouter();

  const updateAttributesHandler = useCallback(
    debounce(
      async ({
        updateQueue,
        //last transaction needs to be pushed into transactionQueue,
        //as the last addTransaction function is executed in parallel with updateQuestAttributeHandler,
        //and cannot be captured inside of updateQuestAttributeHandler function
        lastUpdate,
      }: {
        updateQueue: UpdateQueue;
        lastUpdate: WorkUpdates;
      }) => {
        console.log("...update", rep);
        if (rep) {
          //transactionQueue is immutable, but I'll allow myself to mutate the copy of it
          const _updateQueue = structuredClone(updateQueue);
          const update = _updateQueue.get(id);
          if (!update) {
            _updateQueue.set(id, lastUpdate);
          } else {
            const newUpdate = { ...update, ...lastUpdate };
            _updateQueue.set(id, newUpdate);
          }
          for (const [key, value] of _updateQueue.entries()) {
            console.log("value", value);
            console.log("queue", _updateQueue);
            await rep.mutate.updateWork({ id: key, updates: value });
          }
        }
      },
      1000
    ),
    [id]
  );
  // const handleUnpublish = () => {};

  return (
    <div className="mb-20 mt-10 flex flex-col items-center justify-center">
      <div className="b w-5/6 max-w-2xl rounded-md bg-white p-5 drop-shadow-lg">
        {work && work.published && work.type === "QUEST" ? (
          <NonEditableQuestAttributes quest={work} />
        ) : work && work.type === "QUEST" ? (
          <QuestAttributes
            quest={work}
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
          <div className="h-[250px]">No work found</div>
        )}
        {work && work.published && content ? (
          <NonEditableContent content={content.content} />
        ) : work && !work.published ? (
          <TiptapEditor
            id={work.id}
            content={content ? content.content : undefined}
            type={work.type}
          />
        ) : (
          <div className="h-[255px]">No work found</div>
        )}
      </div>
      {work && !work.published && work.type === "QUEST" && (
        <Publish
          type="QUEST"
          work={work}
          content={content ? content.content : undefined}
        />
      )}
      {work && !work.published && work.type === "SOLUTION" && (
        <Publish
          type="SOLUTION"
          work={work}
          content={content ? content.content : undefined}
        />
      )}

      {work && work.published && (
        <div className="mt-3 flex gap-5">
          <Button className="w-32 bg-red-500">Unpublish</Button>
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
              if (work) void router.push(`/quests/${work.id}`);
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
