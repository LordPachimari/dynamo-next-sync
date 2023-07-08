"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Content,
  MergedWork,
  PublishedMergedWork,
  WorkType,
} from "~/types/types";
import {
  NonEditableQuestAttributes,
  NonEditableSolutionAttributes,
} from "./NonEditableAttributes";

import dynamic from "next/dynamic";
import { useSubscribe } from "replicache-react";
import { WorkspaceStore } from "~/zustand/workspace";
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
import { Button } from "../../ui/Button";
import QuestAttributes from "./QuestAttibutes";
import SolutionAttributes from "./SolutionAttributes";
import * as base64 from "base64-js";
const TiptapEditor = dynamic(() => import("../Tiptap/TiptapEditor"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

import * as Y from "yjs";
import Publish from "./Publish";
import { useAuth } from "@clerk/nextjs";
import { contentKey, workKey } from "~/repl/client/mutators/workspace";
import NonEditableContent from "./NonEditableContent";

const Editor = ({ id }: { id: string }) => {
  const { userId } = useAuth();
  const searchParams = useSearchParams();

  const type = searchParams.get("type") as WorkType;

  const rep = WorkspaceStore((state) => state.rep);
  const resetAttributeErrors = WorkspaceStore((state) => state.resetErrors);

  const [renderCount, setRenderCount] = useState(0);

  const work = useSubscribe(
    rep,
    async (tx) => {
      const editor = (await tx.get(workKey({ id, type }))) || null;

      return editor;
    },

    null,
    [id]
  ) as MergedWork;

  const ydocRef = useRef(new Y.Doc());
  const ydoc = ydocRef.current;
  const Ydoc = useSubscribe(
    rep,
    async (tx) => {
      const content = (await tx.get(contentKey(id))) as Content;
      console.log(content);
      if (content && content.Ydoc) {
        console.log("ydoc from subscribe", content.Ydoc);
        if (ydoc) {
          console.log("updating yjs");
          const update = base64.toByteArray(content.Ydoc);
          Y.applyUpdateV2(ydoc, update);
        }
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
      <div className="w-5/6 max-w-2xl rounded-md border-[1px] bg-white p-4 dark:bg-slate-2 ">
        {work && work.published && work.type === "QUEST" ? (
          <NonEditableQuestAttributes quest={work} />
        ) : work && work.type === "QUEST" ? (
          <QuestAttributes quest={work} />
        ) : work && work.published && work.type === "SOLUTION" ? (
          <NonEditableSolutionAttributes solution={work} />
        ) : work && work.type === "SOLUTION" ? (
          <SolutionAttributes solution={work} />
        ) : (
          <div className="h-[250px]"></div>
        )}
        {work && (
          <TiptapEditor
            id={id}
            ydoc={ydoc}
            setRenderCount={setRenderCount}
            renderCount={renderCount}
            isCreator={userId === work.creatorId}
            work={work}
          />
        )}
      </div>

      {work && work.published && (
        <div className="mt-3 flex gap-5">
          {work.creatorId && userId && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-32 bg-red-500 hover:bg-red-600">
                    Unpublish
                  </Button>
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
                    <AlertDialogAction asChild>
                      <Button className="w-32 bg-red-500 hover:bg-red-600">
                        Unpublish
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          <Button
            className="w-44 bg-green-500 hover:bg-green-600"
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
