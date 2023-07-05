"use client";

import { useRef, type Dispatch, type SetStateAction } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { UndoManager } from "@rocicorp/undo";
import {
  useParams,
  useRouter,
  useSelectedLayoutSegment,
} from "next/navigation";
import { Replicache } from "replicache";
import { useSubscribe } from "replicache-react";
import { ulid } from "ulid";
import { z } from "zod";
import { M } from "~/repl/mutators";
import {
  MergedWorkType,
  Post,
  PostListComponent,
  PostListComponentZod,
  Quest,
  QuestListComponent,
  QuestListComponentZod,
  Solution,
  SolutionListComponent,
  SolutionListComponentZod,
  WorkType,
} from "~/types/types";
import { Button } from "~/ui/Button";
import { cn } from "~/utils/cn";
import { List as LucidList, Trash, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/ui/Dropdown";
import { Copy } from "lucide-react";
import { ScrollArea } from "~/ui/ScrollArea";

export default function List({
  showList,
  toggleShowList,
  rep,
  userId,
}: {
  showList: boolean;
  toggleShowList: Dispatch<SetStateAction<boolean>>;
  rep: Replicache<M> | null;
  userId: string;
}) {
  const segment = useSelectedLayoutSegment();
  const undoManagerRef = useRef(new UndoManager());
  const [parent, enableAnimations] = useAutoAnimate();
  // const [listComponents, setListComponents] = useState<{
  //   quests: QuestListComponent[];
  //   solutions: SolutionListComponent[];
  //   posts: PostListComponent[];
  // }>({ posts: [], quests: [], solutions: [] });
  const quests: QuestListComponent[] = [];
  const solutions: SolutionListComponent[] = [];
  const posts: PostListComponent[] = [];
  const router = useRouter();
  const { id: routerId } = useParams();

  const works = useSubscribe(
    rep,
    async (tx) => {
      const list = await tx.scan({ prefix: "WORK#" }).entries().toArray();

      console.log("list", list);
      return list;
    },
    null,
    []
  );

  if (works) {
    for (const [key, value] of works) {
      const work = value as Post | Solution | Quest;
      if (work.type === "QUEST" && !work.inTrash) {
        quests.push(work);
      } else if (work.type === "SOLUTION" && !work.inTrash) {
        solutions.push(work);
      } else if (work.type === "POST" && !work.inTrash) {
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
        version: 1,
      };
      // await rep.mutate.createQuest({ quest: newQuest });
      await undoManagerRef.current.add({
        execute: () =>
          rep.mutate.createWork({
            work: newQuest as MergedWorkType,
            type: "QUEST",
          }),
        undo: () => rep.mutate.deleteWork({ id: newQuest.id, type: "QUEST" }),
      });
      router.push(`/workspace/${id}?type=QUEST`);
    }
  };
  const handleDeleteWork = async ({
    id,
    type,
  }: {
    id: string;
    type: WorkType;
  }) => {
    if (rep) {
      // await rep.mutate.createQuest({ quest: newQuest });
      await undoManagerRef.current.add({
        execute: async () => {
          await rep.mutate.deleteWork({ id, type });
          if (routerId === id) {
            void router.push("/workspace");
          }
        },
        undo: () => rep.mutate.restoreWork({ id, type }),
      });
    }
  };
  const handleDuplicateWork = async ({
    id,
    type,
  }: {
    id: string;
    type: WorkType;
  }) => {
    const newId = ulid();
    const lastUpdated = new Date().toISOString();
    if (rep) {
      // await rep.mutate.createQuest({ quest: newQuest });
      await undoManagerRef.current.add({
        execute: async () => {
          await rep.mutate.duplicateWork({
            id,
            newId: newId,
            lastUpdated,
            createdAt: lastUpdated,
            type,
          });
        },
        undo: () => rep.mutate.deleteWork({ id: newId, type }),
      });
    }
  };
  return (
    <div className={`listContainer ${showList ? "showList" : ""}`}>
      <div className="flex flex-row-reverse p-2">
        <Button
          aria-label="close list"
          className="bg-blue-100 hover:bg-blue-200"
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
              fill="var(--blue)"
            />
          </svg>
        </Button>
      </div>

      <ScrollArea className="h-5/6 w-full">
        <ul ref={parent}>
          {quests.map((work) => {
            return (
              <span
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onMouseDown={() => {
                  router.push(`/workspace/${work.id}?type=${work.type}`);
                }}
                key={work.id}
                className={cn(
                  "mx-2 my-1 flex cursor-pointer items-center justify-between gap-2 rounded-md p-2 text-sm font-normal hover:bg-blue-100 hover:text-accent-foreground",

                  {
                    "bg-blue-100": segment === work.id,
                  }
                )}
              >
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {work.title || "Untitled"}
                </span>
                {/* <Button className="h-6 w-5 bg-blue-300 hover:bg-blue-400"> */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <LucidList className="w-5 text-blue-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-30">
                    <DropdownMenuItem
                      className="focus:bg-blue-100"
                      onClick={(e) => {
                        handleDuplicateWork({
                          id: work.id,
                          type: work.type as WorkType,
                        }).catch((err) => console.log(err));
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />

                      <span>Duplicate</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        handleDeleteWork({
                          id: work.id,
                          type: work.type as WorkType,
                        }).catch((err) => console.log(err));
                      }}
                      className="focus:bg-blue-100"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* </Button> */}
              </span>
            );
          })}
        </ul>
        <span
          className={cn(
            "mx-2 flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm font-normal hover:bg-blue-100 "
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
              fill="var(--blue)"
            ></path>
          </svg>
          <span className="text-blue-500">Add quest</span>
        </span>
      </ScrollArea>
      <ListSettings>
        <span
          className={cn(
            " mx-2 flex w-[240px] cursor-pointer items-center gap-2 rounded-md p-2 text-sm font-normal text-blue-500 hover:bg-blue-100 hover:text-accent-foreground"
            // path === item.href ? "bg-accent" : "transparent",
            // item.disabled && "cursor-not-allowed opacity-80",
          )}
        >
          <Trash className="text-blue-500" size={20} />
          Trash
        </span>
      </ListSettings>
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

      {children}
    </>
  );
};
