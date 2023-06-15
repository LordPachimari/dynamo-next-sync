import type { ReadTransaction, WriteTransaction } from "replicache";

import {
  Post,
  PostZod,
  Quest,
  QuestZod,
  Solution,
  SolutionZod,
  WorkUpdate,
} from "~/types/types";

export type M = typeof mutators;
export const mutators = {
  createQuest: async (tx: WriteTransaction, { quest }: { quest: Quest }) => {
    console.log("mutators, putQuest");
    const parsedQuest = QuestZod.parse(quest);

    await tx.put(`EDITOR#${quest.id}`, parsedQuest);
  },
  createSolution: async (
    tx: WriteTransaction,
    { solution }: { solution: Solution }
  ) => {
    console.log("mutators, putSolution");
    const parsedSolution = SolutionZod.parse(solution);
    await tx.put(`EDITOR#${solution.id}`, parsedSolution);
  },
  createPost: async (tx: WriteTransaction, { post }: { post: Post }) => {
    console.log("mutators, putPost");

    const parsedPost = PostZod.parse(post);
    await tx.put(`EDITOR#${post.id}`, parsedPost);
  },

  deleteWork: async (tx: WriteTransaction, { id }: { id: string }) => {
    console.log("mutators, deleteWork");
    await tx.del(`EDITOR#${id}`);
  },
  updateWork: async (
    tx: WriteTransaction,
    {
      id,

      updates,
    }: {
      id: string;
      updates: WorkUpdate;
    }
  ): Promise<void> => {
    const quest = (await getWork(tx, { id })) as Quest;
    if (!quest) {
      console.info(`Quest ${id} not found`);
      return;
    }
    const updatedQuest = { ...quest, updates };
    await putWork(tx, { id: `EDITOR#${id}`, quest: updatedQuest });
  },
};
export const getWork = async (tx: ReadTransaction, { id }: { id: string }) => {
  const work = await tx.get(`EDITOR#${id}`);
  if (!work) {
    return undefined;
  }
  return work;
};
export const putWork = async (
  tx: WriteTransaction,
  { quest, id }: { quest: Quest; id: string }
) => {
  await tx.put(id, quest);
};
export const deleteWork = async (
  tx: WriteTransaction,
  { id }: { id: string }
) => {
  await tx.del(id);
};
