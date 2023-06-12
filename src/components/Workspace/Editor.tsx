"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Content,
  Post,
  Quest,
  Solution,
  UpdateQueue,
  WorkUpdate,
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

type MergedWorkType = (Post & Quest & Solution) & {
  type: "POST" | "QUEST" | "SOLUTION";
};
const Editor = ({ id }: { id: string }) => {
  const [rep, setRep] = useState<Replicache<M> | null>(null);
  // const [work, setWork] = useState<
  //   | (Quest & { status?: "OPEN" | "CLOSED" } & Solution &
  //       Post & { type: "QUEST" | "SOLUTION" | "POST" })
  //   | null
  //   | undefined
  // >(undefined);
  useEffect(() => {
    if (rep) {
      return;
    }
    const r = new Replicache({
      name: "user1",
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `/api/replicache-push?spaceId=#WORK#${id}`,
      pullURL: `/api/replicache-pull?spaceId=#WORK#${id}`,
      mutators,
      pullInterval: null,
    });
    setRep(r);
  }, [rep, id]);
  let content: Content | undefined = undefined;
  let work: MergedWorkType | undefined = undefined;
  const WorkAndContent = useSubscribe(
    rep,
    async (tx) => {
      const list = await tx.scan().entries().toArray();

      console.log("list", list);
      return list;
    },
    []
  );
  if (WorkAndContent) {
    for (const [key, value] of WorkAndContent) {
      const WorkOrContent = value as Quest | Post | Solution | Content;
      if (WorkOrContent.type === "CONTENT") {
        content = WorkOrContent as Content;
      } else {
        work = WorkOrContent as MergedWorkType;
      }
    }
  }

  const router = useRouter();

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
  // const handleUnpublish = () => {};

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
          <TiptapEditor id={work.id} content={work.content} type={work.type} />
        ) : (
          <></>
        )}
      </div>
      {work && !work.published && work.type === "QUEST" && (
        <Publish type="QUEST" work={work} />
      )}
      {work && !work.published && work.type === "SOLUTION" && (
        <Publish type="SOLUTION" work={work} />
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
