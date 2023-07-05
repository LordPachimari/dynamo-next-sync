"use client";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
} from "next/navigation";
import { useSubscribe } from "replicache-react";
import {
  NonEditableContent,
  NonEditableQuestAttributes,
} from "~/components/Workspace/NonEditable";
import {
  Content,
  PublishedContent,
  PublishedQuest,
  Solver,
} from "~/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/Avatar";
import { Badge } from "~/ui/Badge";
import { Button } from "~/ui/Button";
import { Card, CardContent, CardHeader } from "~/ui/Card";
import { Skeleton } from "~/ui/Sceleton";
import { cn } from "~/utils/cn";
import { ReplicacheInstancesStore } from "~/zustand/rep";

import * as Y from "yjs";
import { contentKey, workKey } from "~/repl/mutators/workspace";
const solutionStatuses = [
  "POSTED SOLUTION",
  "REJECTED",
  "ACKOWLEDGED",
  "ACCEPTED",
] as const;
export default function QuestPage({ id }: { id: string }) {
  const segment = useSelectedLayoutSegment();

  const rep = ReplicacheInstancesStore((state) => state.publishedQuestsRep);
  console.log("segment", segment);

  const quest = useSubscribe(
    rep,
    async (tx) => {
      const quest = await tx.get(workKey({ id, type: "QUEST" }));
      if (quest) {
        return quest as PublishedQuest;
      }
    },
    null,
    [id]
  );
  const content = useSubscribe(
    rep,
    async (tx) => {
      const content = (await tx.get(
        `PUBLISHED#${contentKey(id)}`
      )) as PublishedContent;
      if (content) {
        return content;
      }
      return null;
    },
    null,
    [id]
  );
  if (!quest) {
    return <div>No quest found</div>;
  }

  return (
    <div className="mb-20 mt-2 flex w-full flex-col items-center justify-center md:flex-row">
      <div className="mt-16 w-11/12 flex-row-reverse gap-4 md:flex">
        <div className="w-fill mb-10 flex h-fit flex-col items-center justify-center gap-5 md:w-4/12">
          <Publisher publisherId="user1" />
          <div className="flex items-center justify-center">
            <Button className="bg-blue-500 hover:bg-blue-600">MESSAGE</Button>
          </div>

          {/* {quest.data.winnerId && ( <Card w="100%" height={{ base: "xs" }} maxW="72" borderRadius="2xl">
                <CardHeader
                  display="flex"
                  justifyContent="center"
                  fontSize="xl"
                  fontWeight="bold"
                  p={2}
                >
                  Winner
                </CardHeader>
                <Winner winnerId={quest.data.winnerId} />
              </Card>
            )} */}
        </div>

        <div className="w-full md:w-8/12">
          <QuestComponent
            quest={quest}
            content={content ? content.content : undefined}
          />
          {/* {isCreator ? (
              <></>
            ) : (
              <Center my={5}>
                {isSolver && userId && (
                  <>
                    <Button
                      colorScheme="red"
                      onClick={onLeaveAlertOpen}
                      mr={5}
                      w={20}
                    >
                      LEAVE
                    </Button>
                    <LeaveAlert
                      isOpen={isLeaveAlertOpen}
                      onClose={onLeaveAlertClose}
                      questId={id}
                      solverId={userId}
                    />
                  </>
                )} */}
          <div className="flex h-16 w-full items-center justify-center">
            <Button
              className="w-20 bg-blue-500 hover:bg-blue-600 "
              //   onClick={onOpen}
              //   isDisabled={ !isSignedIn ||
              //     isSolver ||
              //     quest.data.slots === quest.data.solverCount
              //   }
            >
              JOIN
            </Button>
          </div>
          {/* {userId && (
                  <JoinAlert
                    isOpen={isOpen}
                    isSolver={isSolver}
                    onClose={onClose}
                    quest={quest.data}
                    userId={userId}
                  />
                )} */}

          <h2 className="my-5 text-center text-sm">Solution statuses</h2>

          <div className="mb-5 flex flex-wrap justify-center gap-3 rounded-md border-2 border-blue-200 p-2">
            {solutionStatuses.map((status, i) => (
              <div className="flex gap-2" key={i}>
                <div
                  className={cn(
                    "flex w-[25px] items-center justify-center rounded-[50%] text-white",
                    {
                      "bg-yellow-400": status === "POSTED SOLUTION",
                      "bg-green-400":
                        status === "ACCEPTED" || status === "ACKOWLEDGED",
                      "bg-red-400": status === "REJECTED",
                    }
                  )}
                >
                  {status === "ACCEPTED" && "V"}
                </div>
                <p>{status}</p>
              </div>
            ))}
          </div>
        </div>
        {/* )} */}
        {/* <SolverComponent
          emptySlots={emptySlots}
          creatorId={quest.creatorId}
          questId={id}
          userId="user1"
          solvers={solvers.data}
          solversLoading={solvers.isLoading}
        /> */}
      </div>
    </div>
  );
}
const Publisher = ({ publisherId }: { publisherId: string }) => {
  // if (publisher.isLoading) {
  //   return (
  //     <>
  //       <Skeleton className="h-40 w-full rounded-full" />

  //       <Skeleton className="h-10 w-full rounded-full" />
  //       <Skeleton className="h-10 w-full rounded-full" />
  //       <Skeleton className="h-10 w-full rounded-full" />
  //       <Skeleton className="h-10 w-full rounded-full" />
  //     </>
  //   );
  // }

  return (
    <Card className="h-64 w-full max-w-[300px] rounded-xl drop-shadow-sm">
      <CardHeader className="flex justify-center p-2 text-xl font-bold ">
        Publisher
      </CardHeader>
      <CardContent className="p-2">
        <div className="flex h-40 w-full items-center justify-center rounded-md border-[1px] bg-blue-50 shadow-inner"></div>
        <div className="flex flex-col items-center p-2"></div>
      </CardContent>
    </Card>
  );
};
const Winner = ({ winnerId }: { winnerId: string }) => {
  //   const winner = trpc.user.userComponent.useQuery(
  //     { id: winnerId },
  //     { staleTime: 10 * 60 * 6000 }
  //   );
  //   if (winner.isLoading) {
  //     return (
  // <>
  // //       <Skeleton className="h-40 w-full rounded-full" />
  // //       <Skeleton className="h-10 w-full rounded-full" />
  // //       <Skeleton className="h-10 w-full rounded-full" />
  // //       <Skeleton className="h-10 w-full rounded-full" />
  // //       <Skeleton className="h-10 w-full rounded-full" />
  // //     </>
  //     );
  //   }
  //   return (
  //     <>
  //       <Box w="36" height="md"></Box>
  //       <Text>{winner.data?.username}</Text>
  //     </>
  //   );
};
const QuestComponent = ({
  quest,
  content,
}: {
  quest: PublishedQuest;
  content: string | undefined;
}) => {
  return (
    <Card className="rounded-xl drop-shadow-sm">
      <CardHeader>
        <NonEditableQuestAttributes quest={quest} />
      </CardHeader>
      <CardContent>
        {content && <NonEditableContent content={content} />}
      </CardContent>
    </Card>
  );
};
const SolverComponent = ({
  solvers,
  emptySlots,
  creatorId,
  questId,
  solversLoading,
  userId,
}: {
  solvers: Solver[] | undefined;
  solversLoading: boolean;
  emptySlots: Record<any, any>[];
  creatorId: string;
  questId: string;
  userId: string | null | undefined;
}) => {
  const emptySkeletonSlots: Record<any, any>[] = [];

  for (let i = 0; i < 5; i++) {
    emptySkeletonSlots.push({});
  }

  return (
    <div className="flex flex-wrap gap-5">
      {solversLoading
        ? emptySkeletonSlots.map((s, i) => <SolverSkeleton key={i} />)
        : solvers &&
          solvers.map((s) => (
            <div className="flex" key={s.id}>
              <_Solver
                solver={s}
                isAuthorised={userId === creatorId || userId === s.id}
                questId={questId}
              />
            </div>
          ))}

      {!solversLoading && emptySlots.map((s, i) => <EmptySlot key={i} />)}
    </div>
  );
};
const SolverSkeleton = () => {
  return (
    <div className="flex items-center gap-2">
      <Card className="flex h-14 w-44 flex-row items-center gap-2 rounded-xl">
        {/* <SkeletonCircle size="40px" ml={2}></SkeletonCircle> */}
        <div className="flex-col gap-3">
          {/* <Skeleton w="28" h="2" />
          <Skeleton w="20" h="2" /> */}
        </div>
      </Card>
      {/* <Circle size="25px" borderWidth="2px" borderColor="gray.300"></Circle> */}
    </div>
  );
};
const _Solver = ({
  solver,
  isAuthorised,
  questId,
}: {
  solver: Solver;
  isAuthorised: boolean;
  questId: string;
}) => {
  console.log(solver);
  return (
    <div>
      <div className="flex gap-2">
        <Link href={`/profile/${solver.username}`}>
          <Card className="flex h-14 w-36 flex-row items-center gap-2 rounded-xl">
            {/* <Circle size="40px" ml={2}></Circle> */}

            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden text-ellipsis whitespace-nowrap">
              <Badge className="w-10 bg-blue-400">{solver.level} LVL</Badge>
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold">
                {solver.username}
              </p>
            </div>
          </Card>
        </Link>

        <div className="flex h-14 items-center justify-center">
          {/* {solver.status ? ( <Tooltip label={solver.status} placement="top">
              <Circle
                size="25px"
                bg={
                  solver.status === "ACCEPTED"
                    ? "green.300"
                    : solver.status === "ACKNOWLEDGED"
                    ? " green.300"
                    : solver.status === "REJECTED"
                    ? "red.300"
                    : "yellow.200"
                }
              >
                {solver.status === "ACCEPTED" && "V"}
              </Circle>
            </Tooltip>
          ) : (
            <Tooltip label="status" placement="top">
              <Circle
                size="25px"
                borderWidth="2px"
                borderColor="gray.300"
              ></Circle>
            </Tooltip>
          )} */}
        </div>
      </div>
      {isAuthorised && solver.solutionId && (
        <Link href={`/solutions/${solver.solutionId}?quest=${questId}`}>
          <Button className="bg-green-400">View solution</Button>
        </Link>
      )}
    </div>
  );
};
const EmptySlot = () => {
  return (
    <div className="flex gap-2">
      <div className="flex h-14 w-28 items-center justify-center border-2 border-orange-200 bg-orange-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            d="M14 14.252v2.09A6 6 0 0 0 6 22l-2-.001a8 8 0 0 1 10-7.748zM12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm6 6v-3h2v3h3v2h-3v3h-2v-3h-3v-2h3z"
            fill="var(--blue)"
          />
        </svg>
      </div>

      <div className="flex h-14 items-center justify-center">
        {/* <Tooltip label="status" placement="top">
          <Circle size="25px" borderWidth="2px" borderColor="blue.200"></Circle>
        </Tooltip> */}
      </div>
    </div>
  );
};
