"use client";

import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { UndoManager } from "@rocicorp/undo";
import { Replicache } from "replicache";
import { useSubscribe } from "replicache-react";
import { ulid } from "ulid";
import { z } from "zod";
import { env } from "~/env.mjs";
import { M, mutators } from "~/repl/mutators";
import {
  Post,
  PostListComponent,
  PostListComponentZod,
  PostZod,
  Quest,
  QuestListComponent,
  QuestListComponentZod,
  QuestZod,
  Solution,
  SolutionListComponent,
  SolutionListComponentZod,
  SolutionZod,
} from "~/types/types";
import { cn } from "~/utils/cn";
import { Button } from "~/ui/Button";
import { WORKSPACE_LIST } from "~/utils/constants";
import Link from "next/link";

export default function List({
  showList,
  toggleShowList,
  userId,
}: {
  userId: string;
  showList: boolean;
  toggleShowList: Dispatch<SetStateAction<boolean>>;
}) {
  const undoManagerRef = useRef(new UndoManager());
  const [rep, setRep] = useState<Replicache<M> | null>(null);
  const [parent, enableAnimations] = useAutoAnimate();
  const quests: QuestListComponent[] = [];
  const solutions: SolutionListComponent[] = [];
  const posts: PostListComponent[] = [];
  useEffect(() => {
    if (rep) {
      return;
    }
    if (userId) {
      const r = new Replicache({
        name: userId,
        licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
        pushURL: `/api/replicache-push?spaceId=${WORKSPACE_LIST}`,
        pullURL: `/api/replicache-pull?spaceId=${WORKSPACE_LIST}`,
        mutators,
        pullInterval: null,
      });
      setRep(r);
    }
  }, [rep, userId]);

  const WorkZod = z.union([
    QuestListComponentZod,
    SolutionListComponentZod,
    PostListComponentZod,
  ]);

  const works = useSubscribe(
    rep,
    async (tx) => {
      const list = await tx.scan({ prefix: "EDITOR" }).entries().toArray();

      console.log("list", list);
      return list;
    },
    []
  );
  if (works) {
    for (const [key, value] of works) {
      const work = value as Post | Solution | Quest;
      if (work.type === "QUEST") {
        quests.push(work);
      } else if (work.type === "SOLUTION") {
        solutions.push(work);
      } else {
        posts.push(work as Post);
      }
    }
  }
  const handleCreateQuest = async () => {
    if (rep) {
      const id = ulid();
      const createdAt = new Date().toString();

      const newQuest: Quest = {
        id,
        createdAt,
        creatorId: userId,
        inTrash: false,
        lastUpdated: createdAt,
        published: false,
        type: "QUEST",
      };
      // await rep.mutate.createQuest({ quest: newQuest });
      await undoManagerRef.current.add({
        execute: () => rep.mutate.createQuest({ quest: newQuest }),
        undo: () => rep.mutate.deleteQuest({ id: newQuest.id }),
      });
    }
    console.log("no rep");
  };
  return (
    <div className={`listContainer ${showList ? "showList" : ""}`}>
      <div className="flex flex-row-reverse p-2">
        <Button
          aria-label="close list"
          className="bg-orange-100 hover:bg-orange-200"
          onClick={() => {
            toggleShowList((val) => !val);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path fill="none" d="M0 0H24V24H0z" />
            <path
              d="M21 18v2H3v-2h18zM6.596 3.904L8.01 5.318 4.828 8.5l3.182 3.182-1.414 1.414L2 8.5l4.596-4.596zM21 11v2h-9v-2h9zm0-7v2h-9V4h9z"
              fill="var(--orange)"
            />
          </svg>
        </Button>
      </div>
      <ListSettings>
        <span
          className={cn(
            "mx-2 flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm font-normal hover:bg-orange-100 hover:text-accent-foreground"
            // path === item.href ? "bg-accent" : "transparent",
            // item.disabled && "cursor-not-allowed opacity-80",
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z"
              fill="var(--orange)"
            />
          </svg>
          Trash
        </span>
      </ListSettings>
      <ul ref={parent}>
        {quests.map((value) => {
          const work = WorkZod.parse(value);
          return (
            <Link key={work.id} href={`/workspace/${work.id}`}>
              <span
                key={work.id}
                className={cn(
                  "mx-2 flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm font-normal hover:bg-orange-100 hover:text-accent-foreground"
                  // path === item.href ? "bg-accent" : "transparent",
                  // item.disabled && "cursor-not-allowed opacity-80",
                )}
              >
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {work.title || "Untitled"}
                </span>
              </span>
            </Link>
          );
        })}
      </ul>
      <span
        className={cn(
          "mx-2 flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm font-normal hover:bg-orange-100 hover:text-accent-foreground"
          // path === item.href ? "bg-accent" : "transparent",
          // item.disabled && "cursor-not-allowed opacity-80",
        )}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={async () => await handleCreateQuest()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path
            d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"
            fill="var(--orange)"
          ></path>
        </svg>
        <span className="text-orange-500">Add quest</span>
      </span>
    </div>
  );
}
const ListSettings = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {/* <Button
        justifyContent="flex-start"
        pl="2"
        borderRadius={0}
        bg="none"
        leftIcon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15zm-3.847-8.699a2 2 0 1 0 2.646 2.646 4 4 0 1 1-2.646-2.646z"
              fill="var(--blue)"
            />
          </svg>
        }
        w="100%"
        color="gray.500"
        onClick={onOpenSearchModal}
      >
        Search
      </Button> */}
      {/* <SearchComponent
        onClose={onCloseSearchModal}
        isOpen={isOpenSearchModal}
        onOpen={onOpenSearchModal}
      /> */}
      <span
        className={cn(
          "mx-2 flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm font-normal hover:bg-orange-100 hover:text-accent-foreground"
          // path === item.href ? "bg-accent" : "transparent",
          // item.disabled && "cursor-not-allowed opacity-80",
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 18c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8zm1-8h3l-4 4-4-4h3V8h2v4z"
            fill="var(--orange)"
          />
        </svg>
        <span>{"Import"}</span>
      </span>

      {children}
    </>
  );
};
