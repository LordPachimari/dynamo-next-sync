"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  YJSContent,
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

import dynamic from "next/dynamic";

const TiptapEditor = dynamic(() => import("../Tiptap/TiptapEditor"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});
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
import { M, YJSKey, mutators } from "~/repl/mutators";
import { env } from "~/env.mjs";
import { useSubscribe } from "replicache-react";
import { WorkspaceStore } from "~/zustand/workspace";
// });

const Editor = ({ id }: { id: string }) => {
  const rep = WorkspaceStore((state) => state.rep);
  const work = useSubscribe(
    rep,
    async (tx) => {
      const editor = (await tx.get(`EDITOR#${id}`)) || null;

      return editor;
    },

    null,
    [id]
  ) as MergedWorkType;
  // const content = useSubscribe(
  //   rep,
  //   async (tx) => {
  //     const c = (await tx.get(`CONTENT#${id}`)) || null;

  //     return c;
  //   },
  //   null,
  //   [id]
  // ) as { content: string; text: string } | undefined;

  const docStateFromReplicache = useSubscribe(
    rep,
    async (tx) => {
      const content = (await tx.get(YJSKey(id))) as YJSContent;
      console.log(content);
      if (content.Ydoc) {
        console.log("ydoc from subscribe", content.Ydoc);
        return content.Ydoc;
      }
      return null;
    },
    null,
    [id]
  );

  const router = useRouter();

  return (
    <div className="mb-20 mt-10 flex flex-col items-center justify-center">
      <div className="b w-5/6 max-w-2xl rounded-md bg-white p-5 drop-shadow-lg">
        {work && work.published && work.type === "QUEST" ? (
          <NonEditableQuestAttributes quest={work} />
        ) : work && work.type === "QUEST" ? (
          <QuestAttributes quest={work} />
        ) : work && work.published && work.type === "SOLUTION" ? (
          <NonEditableSolutionAttributes solution={work} />
        ) : work && work.type === "SOLUTION" ? (
          <SolutionAttributes solution={work} />
        ) : (
          <div className="h-[250px]">No work found</div>
        )}
        {work && work.published ? (
          // &&
          //  content
          // <NonEditableContent content={content.content} />
          <></>
        ) : work && !work.published ? (
          <TiptapEditor id={id} Ydoc={docStateFromReplicache} />
        ) : (
          <div className="h-[255px]">No work found</div>
        )}
      </div>
      {/* {work && !work.published && (
        <Publish work={work} content={content ? content.content : undefined} />
      )} */}

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
