import { WriteTransaction } from "replicache";
import { userKey } from "./user";
import { workKey } from "./workspace";
import {
  PublishedQuest,
  Quest,
  Solution,
  SolverPartial,
  User,
} from "~/types/types";

export const questMutators = {
  joinQuest: async (
    tx: WriteTransaction,
    { userId, questId }: { userId: string; questId: string }
  ) => {
    await tx.put(`SOLVER#${questId}#${userId}`, {
      id: userId,
    });
  },
  leaveQuest: async (
    tx: WriteTransaction,
    { userId, questId }: { userId: string; questId: string }
  ) => {
    await tx.del(`SOLVER#${questId}#${userId}`);
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
    const [solver, solution, quest, user] = (await Promise.all([
      tx.get(`SOLVER#${questId}#${solverId}`),
      tx.get(workKey({ id: solutionId, type: "SOLUTION" })),
      tx.get(workKey({ id: questId, type: "QUEST" })),
      tx.get(userKey(solverId)),
    ])) as [
      solver: SolverPartial | undefined,
      solution: PublishedQuest | undefined,
      quest: PublishedQuest | undefined,
      user: User | undefined
    ];
    if (solver && solution && quest && user) {
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
    ])) as [
      solver: SolverPartial | undefined,
      solution: PublishedQuest | undefined
    ];
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
    ])) as [
      solver: SolverPartial | undefined,
      solution: PublishedQuest | undefined
    ];
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
