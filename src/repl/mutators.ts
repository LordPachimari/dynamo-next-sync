import type {
  ReadTransaction,
  ReadonlyJSONValue,
  WriteTransaction,
} from "replicache";
import { ulid } from "ulid";

import {
  Content,
  ContentUpdates,
  ContentUpdatesZod,
  ContentZod,
  MergedWorkType,
  Post,
  PostZod,
  Quest,
  QuestZod,
  Solution,
  SolutionZod,
  WorkType,
  WorkUpdates,
  WorkZod,
} from "~/types/types";

export type M = typeof mutators;
export const mutators = {
  createWork: async (tx: WriteTransaction, { work }: { work: WorkType }) => {
    console.log("mutators, putQuest");
    const parsedWork = WorkZod.parse(work);

    await tx.put(`EDITOR#${work.id}`, parsedWork);
  },

  duplicateWork: async (
    tx: WriteTransaction,
    {
      id,
      newId,
      createdAt,
      lastUpdated,
    }: { id: string; newId: string; lastUpdated: string; createdAt: string }
  ) => {
    console.log("mutators, duplicateWork");
    const work = await getWork(tx, { id });
    const content = (await tx.get(`CONTENT#${id}`)) as Content;
    const copy = structuredClone(work) as WorkType;
    if (work && content) {
      await tx.put(`EDITOR#${newId}`, {
        ...copy,
        id: newId,
        createdAt,
        lastUpdated,
      });
      await tx.put(`CONTENT#${newId}`, {
        ...content,
        lastUpdated,
      } as Content);
    }
  },
  deleteWork: async (tx: WriteTransaction, { id }: { id: string }) => {
    console.log("mutators, deleteWork");
    const work = (await tx.get(`EDITOR#${id}`)) as MergedWorkType | undefined;
    if (work) {
      await tx.put(`EDITOR#${id}`, { ...work, inTrash: true });
    }
  },
  deleteWorkPermanently: async (
    tx: WriteTransaction,
    { id }: { id: string }
  ) => {
    console.log("mutators, perm delete");
    await tx.del(`EDITOR#${id}`);
  },
  restoreWork: async (tx: WriteTransaction, { id }: { id: string }) => {
    console.log("mutators, restore");
    const work = (await tx.get(`EDITOR#${id}`)) as MergedWorkType | undefined;
    if (work) {
      await tx.put(`EDITOR#${id}`, { ...work, inTrash: false });
    }
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
  updateContent: async (
    tx: WriteTransaction,
    {
      id,
      content,
    }: {
      id: string;
      content: ContentUpdates;
    }
  ) => {
    const contentUpdates = ContentUpdatesZod.parse(content);
    await tx.put(`CONTENT#${id}`, contentUpdates);
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
