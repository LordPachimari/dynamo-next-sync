"use client";

import {
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
  useState,
  useEffect,
} from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { UndoManager } from "@rocicorp/undo";
import {
  Album,
  ArchiveRestoreIcon,
  BookOpenCheck,
  ChevronDown,
  Copy,
  FileEdit,
  List as LucidList,
  MoreVertical,
  Plus,
  Trash,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  useParams,
  useRouter,
  useSelectedLayoutSegment,
} from "next/navigation";
import { Replicache } from "replicache";
import { useSubscribe } from "replicache-react";
import { ulid } from "ulid";
import { WorkspaceMutators } from "~/repl/client/mutators/workspace";
import {
  MergedWork,
  Post,
  PostListComponent,
  Quest,
  Solution,
  WorkType,
} from "~/types/types";
import { Button } from "~/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/Dropdown";
import { ScrollArea } from "~/ui/ScrollArea";
import { cn } from "~/utils/cn";
import { ArrowBigLeftDash } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/ui/Collapsible";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/Tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/Card";
import { Label } from "~/ui/label";
import { Input } from "~/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/Dialog";
import { DialogOverlay } from "@radix-ui/react-dialog";
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
} from "~/ui/AlertDialog";

export default function List({
  showList,
  toggleShowList,
  rep,
  userId,
}: {
  showList: boolean;
  toggleShowList: Dispatch<SetStateAction<boolean>>;
  rep: Replicache<WorkspaceMutators> | null;
  userId: string;
}) {
  const segment = useSelectedLayoutSegment();
  const undoManagerRef = useRef(new UndoManager());
  const quests: Quest[] = [];
  const solutions: Solution[] = [];
  const posts: Post[] = [];
  const trash: MergedWork[] = [];
  const router = useRouter();
  const { id: routerId } = useParams();
  const [type, setType] = useState<WorkType>("QUEST");

  const works = useSubscribe(
    rep,
    async (tx) => {
      const list = await tx.scan({ prefix: "WORK#" }).entries().toArray();
      return list;
    },
    null,
    []
  );

  if (works) {
    for (const [key, value] of works) {
      const work = value as Post & Solution & Quest;
      if (work.type === "QUEST" && !work.inTrash) {
        quests.push(work);
      } else if (work.type === "SOLUTION" && !work.inTrash) {
        solutions.push(work);
      } else if (work.type === "POST" && !work.inTrash) {
        posts.push(work as Post);
      } else if (work.inTrash) {
        trash.push(work);
      }
    }
  }

  const handleCreateQuest = useCallback(async () => {
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
      await undoManagerRef.current.add({
        execute: () =>
          rep.mutate.createWork({
            work: newQuest as MergedWork,
            type: "QUEST",
          }),
        undo: () => rep.mutate.deleteWork({ id: newQuest.id, type: "QUEST" }),
      });
      router.push(`/workspace/${id}?type=QUEST`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rep, userId]);
  const handleDeleteWork = useCallback(
    async ({ id, type }: { id: string; type: WorkType }) => {
      if (rep) {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rep]
  );
  const handlePermDeleteWork = useCallback(
    async ({ id, type }: { id: string; type: WorkType }) => {
      if (rep) {
        await rep.mutate.deleteWorkPermanently({ id, type });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rep]
  );
  const handleDuplicateWork = useCallback(
    async ({ id, type }: { id: string; type: WorkType }) => {
      const newId = ulid();
      const lastUpdated = new Date().toISOString();
      if (rep) {
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
    },
    [rep]
  );
  const handleRestoreWork = useCallback(
    async ({ id, type }: { id: string; type: WorkType }) => {
      if (rep) {
        await undoManagerRef.current.add({
          execute: async () => {
            await rep.mutate.restoreWork({ id, type });
          },
          undo: () => rep.mutate.deleteWork({ id, type }),
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rep]
  );
  return (
    <div className={`listContainer ${showList ? "showList" : ""}`}>
      <div>
        <div className="relative flex flex-row-reverse p-2">
          <Button
            aria-label="close list"
            size="icon"
            className="bg-blue-4 hover:bg-blue-5"
            onClick={() => {
              toggleShowList((val) => !val);
            }}
          >
            <ArrowBigLeftDash className="text-blue-9" />
          </Button>
        </div>
        <Tabs defaultValue={type} className="w-full p-1">
          <TabsList className="grid w-full grid-cols-3 gap-2 shadow-inner">
            <TabsTrigger value="SOLUTION" onClick={() => setType("SOLUTION")}>
              Solutions
            </TabsTrigger>

            <TabsTrigger value="QUEST" onClick={() => setType("QUEST")}>
              Quests
            </TabsTrigger>
            <TabsTrigger value="POST" onClick={() => setType("POST")}>
              Posts
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Items
          type={type}
          handleCreateQuest={handleCreateQuest}
          handleDeleteWork={handleDeleteWork}
          handleDuplicateWork={handleDuplicateWork}
          quests={quests}
          posts={posts}
          solutions={solutions}
          segment={segment || ""}
        />
      </div>

      <div>
        <TrashComponent
          trash={trash}
          handleRestoreWork={handleRestoreWork}
          handlePermDeleteWork={handlePermDeleteWork}
        />
      </div>
    </div>
  );
}
const Items = ({
  handleDeleteWork,
  handleCreateQuest,
  handleDuplicateWork,
  segment,
  type,
  posts,
  quests,
  solutions,
}: {
  type: WorkType;
  quests: Quest[];
  posts: Post[];
  solutions: Solution[];
  handleCreateQuest: () => Promise<void>;
  handleDeleteWork: (props: { id: string; type: WorkType }) => Promise<void>;
  segment: string;
  handleDuplicateWork: (props: { id: string; type: WorkType }) => Promise<void>;
}) => {
  const router = useRouter();

  const [parent, enableAnimations] = useAutoAnimate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  useEffect(() => {
    const storedState = localStorage.getItem(type);
    if (storedState !== null)
      setIsCollapsed(JSON.parse(storedState) as boolean);
  }, [type]);

  return (
    <ScrollArea className="h-fit w-full">
      <ul ref={parent}>
        {type === "QUEST" &&
          quests &&
          quests.map((work) => {
            return (
              <Item
                handleDeleteWork={handleDeleteWork}
                router={router}
                segment={segment}
                work={work}
                key={work.id}
              />
            );
          })}
        {type === "SOLUTION" &&
          solutions &&
          solutions.map((work) => {
            return (
              <Item
                handleDeleteWork={handleDeleteWork}
                router={router}
                segment={segment}
                work={work}
                key={work.id}
              />
            );
          })}
        {type === "POST" &&
          posts &&
          posts.map((work) => {
            return (
              <Item
                handleDeleteWork={handleDeleteWork}
                router={router}
                segment={segment}
                work={work as MergedWork}
                key={work.id}
              />
            );
          })}
      </ul>
      <span
        className={cn(
          "mx-2 flex cursor-pointer items-center gap-2 rounded-md p-2 text-xs font-normal text-slate-600 hover:bg-blue-4 hover:text-blue-9 "
          // path === item.href ? "bg-accent" : "transparent",
          // item.disabled && "cursor-not-allowed opacity-80",
        )}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={async () => {
          if (type === "QUEST") await handleCreateQuest();
        }}
      >
        <Plus size={20} className="text-blue-9" />
        <p>add {type.toLocaleLowerCase()}</p>
      </span>
    </ScrollArea>
  );
};
const Item = ({
  router,
  work,
  segment,
  handleDeleteWork,
}: {
  router: AppRouterInstance;
  work: MergedWork;
  segment: string;
  handleDeleteWork: ({
    id,
    type,
  }: {
    id: string;
    type: WorkType;
  }) => Promise<void>;
}) => {
  return (
    <span
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onMouseDown={() => {
        router.push(`/workspace/${work.id}?type=${work.type}`);
      }}
      key={work.id}
      className={cn(
        "relative mx-1 my-1 flex w-[247px]  cursor-pointer items-center gap-2  rounded-md p-2 text-sm font-normal text-slate-600 hover:bg-blue-4 hover:text-blue-9 dark:text-white",

        {
          "bg-blue-4 text-blue-9": segment === work.id,
        }
      )}
    >
      <BookOpenCheck size={20} className="text-blue-9" />
      <p className="w-[180px] overflow-hidden text-ellipsis whitespace-nowrap ">
        {work.title || "Untitled"}
      </p>
      {/* <Button className="h-6 w-5 bg-blue-300 hover:bg-blue-400"> */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="absolute right-2 ml-2">
          <MoreVertical size={15} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-30">
          <DropdownMenuItem
            onClick={(e) => {
              handleDeleteWork({
                id: work.id,
                type: work.type as WorkType,
              }).catch((err) => console.log(err));
            }}
            className="focus:bg-blue-100"
          >
            <Trash2 className="text-blue mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* </Button> */}
    </span>
  );
};
const TrashItem = ({
  work,
  handleRestoreWork,
  handlePermDeleteWork,
}: {
  work: MergedWork;
  handleRestoreWork: ({
    id,
    type,
  }: {
    id: string;
    type: WorkType;
  }) => Promise<void>;
  handlePermDeleteWork: ({
    id,
    type,
  }: {
    id: string;
    type: WorkType;
  }) => Promise<void>;
}) => {
  return (
    <Card className="flex h-10 items-center justify-between p-2 shadow-lg">
      <h3>{work.title}</h3>
      <div>
        <Button
          size={"icon"}
          className=" bg-transparent hover:bg-slate-200"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={() => handleRestoreWork({ id: work.id, type: work.type })}
        >
          <Undo2 className="text-black" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size={"icon"} className="bg-transparent hover:bg-slate-200">
              <Trash2 className="text-red-9" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="dark:border-slate-6">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm your action</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure to permanently delete?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  className=" bg-red-9 text-white hover:bg-red-10"
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={() =>
                    handlePermDeleteWork({ id: work.id, type: work.type })
                  }
                >
                  Delete
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};
const TrashComponent = ({
  trash,
  handleRestoreWork,
  handlePermDeleteWork,
}: {
  trash: MergedWork[];
  handleRestoreWork: ({
    id,
    type,
  }: {
    id: string;
    type: WorkType;
  }) => Promise<void>;
  handlePermDeleteWork: ({
    id,
    type,
  }: {
    id: string;
    type: WorkType;
  }) => Promise<void>;
}) => {
  return (
    <Dialog>
      <DialogTrigger>
        <span
          className={cn(
            " mx-2 flex w-[240px] cursor-pointer items-center gap-2 rounded-md p-2 text-sm font-normal text-slate-600 hover:bg-blue-6  hover:text-blue-9"
            // path === item.href ? "bg-accent" : "transparent",
            // item.disabled && "cursor-not-allowed opacity-80",
          )}
        >
          <Trash size={20} className="text-blue-9" />
          <p>Trash</p>
        </span>
      </DialogTrigger>
      <DialogContent className="bg-slate-100">
        <DialogHeader>
          <DialogTitle>Trash</DialogTitle>
        </DialogHeader>
        {trash.map((t) => (
          <TrashItem
            work={t}
            key={t.id}
            handleRestoreWork={handleRestoreWork}
            handlePermDeleteWork={handlePermDeleteWork}
          />
        ))}
      </DialogContent>
    </Dialog>
  );
};
const ListSettings = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
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
    </div>
  );
};
