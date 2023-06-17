import type {
  ReadTransaction,
  ReadonlyJSONValue,
  WriteTransaction,
} from "replicache";

import {
  MergedWorkType,
  Post,
  PostZod,
  Quest,
  QuestZod,
  Solution,
  SolutionZod,
  WorkUpdates,
  WorkZod,
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

  duplicateWork: async (
    tx: WriteTransaction,
    { work }: { work: MergedWorkType }
  ) => {
    console.log("mutators, duplicateWork");
    const parsedWork = WorkZod.parse(work);
    await tx.put(`EDITOR#${parsedWork.id}`, parsedWork);
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
      updates: WorkUpdates;
    }
  ): Promise<void> => {
    const work = (await getWork(tx, { id })) as Quest;
    if (!work) {
      console.info(`Quest ${id} not found`);
      return;
    }
    const updated = { ...work, ...updates };
    await putWork(tx, { id: `EDITOR#${id}`, work: updated });
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
  { work, id }: { work: ReadonlyJSONValue; id: string }
) => {
  await tx.put(id, work);
};
export const deleteWork = async (
  tx: WriteTransaction,
  { id }: { id: string }
) => {
  await tx.del(id);
};
