import { WriteTransaction } from "replicache";
import { userKey } from "./user";
import { workKey } from "./workspace";
import { PublishedQuest, Quest, Solution, Solver, User } from "~/types/types";
export type QuestMutators = typeof questMutators;
export const questMutators = {
  joinQuest: async (
    tx: WriteTransaction,
    {
      userId,
      questId,
      username,
      level,
      profile,
    }: {
      userId: string;
      questId: string;
      username: string;
      level: number;
      profile?: string;
      publisherId: string;
    }
  ) => {
    const quest = (await tx.get(workKey({ id: questId, type: "QUEST" }))) as
      | PublishedQuest
      | undefined;
    if (quest && quest.slots >= quest.solversCount + 1) {
      await Promise.all([
        tx.put(`SOLVER#${questId}#${userId}`, {
          id: userId,
          username,
          level,
          ...(profile && { profile }),
        }),
        tx.put(workKey({ id: questId, type: "QUEST" }), {
          ...quest,
          solversCount: quest.solversCount + 1,
        }),
      ]);
    }
  },
  leaveQuest: async (
    tx: WriteTransaction,
    {
      userId,
      questId,
      publisherId,
    }: { userId: string; questId: string; publisherId: string }
  ) => {
    const quest = (await tx.get(workKey({ id: questId, type: "QUEST" }))) as
      | PublishedQuest
      | undefined;
    if (quest) {
      await Promise.all([
        tx.del(`SOLVER#${questId}#${userId}`),

        tx.put(workKey({ id: questId, type: "QUEST" }), {
          ...quest,
          solversCount: quest.solversCount - 1,
        }),
      ]);
    }
  },
  acceptSolution: async (
    tx: WriteTransaction,
    {
      solverId,
      questId,
      solutionId,
    }: {
      solverId: string;
      questId: string;
      solutionId: string;
    }
  ) => {
    const [solver, solution, quest] = (await Promise.all([
      tx.get(`SOLVER#${questId}#${solverId}`),
      tx.get(workKey({ id: solutionId, type: "SOLUTION" })),
      tx.get(workKey({ id: questId, type: "QUEST" })),
    ])) as [
      solver: Solver | undefined,
      solution: PublishedQuest | undefined,
      quest: PublishedQuest | undefined
    ];
    if (solver && solution && quest) {
      await Promise.all([
        tx.put(`SOLVER#${questId}#${solverId}`, {
          ...solver,
          status: "ACCEPTED",
        }),
        tx.put(workKey({ id: solutionId, type: "SOLUTION" }), {
          ...solution,
          status: "ACCEPTED",
        }),
        tx.put(workKey({ id: solutionId, type: "QUEST" }), {
          ...quest,
          status: "CLOSED",
        }),
      ]);
    }
  },
  acknowledgeSolution: async (
    tx: WriteTransaction,
    {
      solverId,
      questId,
      solutionId,
    }: {
      solverId: string;
      questId: string;
      solutionId: string;
    }
  ) => {
    const [solver, solution] = (await Promise.all([
      tx.get(`SOLVER#${questId}#${solverId}`),
      tx.get(workKey({ id: solutionId, type: "SOLUTION" })),
    ])) as [solver: Solver | undefined, solution: PublishedQuest | undefined];
    if (solver && solution) {
      await Promise.all([
        tx.put(`SOLVER#${questId}#${solverId}`, {
          ...solver,
          status: "ACKNOWLEDGE",
        }),
        tx.put(workKey({ id: solutionId, type: "SOLUTION" }), {
          ...solution,
          status: "ACKNOWLEDGE",
        }),
      ]);
    }
  },
  rejectSolution: async (
    tx: WriteTransaction,
    {
      solverId,
      questId,
      solutionId,
    }: {
      solverId: string;
      questId: string;
      solutionId: string;
    }
  ) => {
    const [solver, solution] = (await Promise.all([
      tx.get(`SOLVER#${questId}#${solverId}`),
      tx.get(workKey({ id: solutionId, type: "SOLUTION" })),
    ])) as [solver: Solver | undefined, solution: PublishedQuest | undefined];
    if (solver && solution) {
      await Promise.all([
        tx.put(`SOLVER#${questId}#${solverId}`, {
          ...solver,
          status: "REJECTED",
        }),
        tx.put(workKey({ id: solutionId, type: "SOLUTION" }), {
          ...solution,
          status: "REJECTED",
        }),
      ]);
    }
  },
};
