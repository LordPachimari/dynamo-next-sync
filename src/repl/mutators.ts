import type {
  ReadTransaction,
  ReadonlyJSONValue,
  WriteTransaction,
} from "replicache";

import {
  MergedWorkType,
  Quest,
  WorkType,
  WorkUpdates,
  WorkZod,
  Content,
} from "~/types/types";

export type M = typeof mutators;
export const mutators = {
  createWork: async (tx: WriteTransaction, { work }: { work: WorkType }) => {
    console.log("mutators, putQuest");
    const parsedWork = WorkZod.parse(work);
    const newContent: Content = {
      inTrash: false,
      published: false,
      type: "CONTENT",
    };

    await Promise.all([
      tx.put(workKey(work.id), parsedWork),
      tx.put(YJSKey(work.id), newContent),
    ]);
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
    const content = (await tx.get(YJSKey(id))) as string;

    if (work && content) {
      await tx.put(workKey(newId), {
        id: newId,
        createdAt,
        lastUpdated,
      });
      await tx.put(YJSKey(newId), content);
    }
  },
  deleteWork: async (tx: WriteTransaction, { id }: { id: string }) => {
    console.log("mutators, deleteWork");
    const work = (await tx.get(workKey(id))) as MergedWorkType | undefined;
    if (work) {
      await tx.put(workKey(id), { ...work, inTrash: true });
    }
  },
  deleteWorkPermanently: async (
    tx: WriteTransaction,
    { id }: { id: string }
  ) => {
    console.log("mutators, perm delete");
    await tx.del(workKey(id));
  },
  restoreWork: async (tx: WriteTransaction, { id }: { id: string }) => {
    console.log("mutators, restore");
    const work = (await tx.get(workKey(id))) as MergedWorkType | undefined;
    if (work) {
      await tx.put(workKey(id), { ...work, inTrash: false });
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
    await putWork(tx, { id, work: updated });
  },

  async updateYJS(
    tx: WriteTransaction,
    { id, update }: { id: string; update: { Ydoc: string } }
  ) {
    const prevYJS = (await getYJS(tx, { id })) as Content;

    const updated = { ...prevYJS, ...update };
    await tx.put(YJSKey(id), updated);
  },
  async updateYJSAwareness(
    tx: WriteTransaction,
    {
      name,
      yjsClientID,
      update,
    }: { name: string; yjsClientID: number; update: string }
  ) {
    await tx.put(awarenessKey(name, yjsClientID), update);
  },

  async removeYJSAwareness(
    tx: WriteTransaction,
    { name, yjsClientID }: { name: string; yjsClientID: number }
  ) {
    await tx.del(awarenessKey(name, yjsClientID));
  },
};
export const getYJS = async (tx: ReadTransaction, { id }: { id: string }) => {
  const yjs = await tx.get(YJSKey(id));
  if (!yjs) {
    return undefined;
  }
  return yjs;
};
export const getWork = async (tx: ReadTransaction, { id }: { id: string }) => {
  const work = await tx.get(workKey(id));
  if (!work) {
    return undefined;
  }
  return work;
};
export const putWork = async (
  tx: WriteTransaction,
  { work, id }: { work: ReadonlyJSONValue; id: string }
) => {
  await tx.put(workKey(id), work);
};

function awarenessKey(key: string, yjsClientID: number): string {
  return `${YJSKey(key)}/awareness/${yjsClientID}`;
}

export function workKey(key: string): string {
  return `WORK#${key}`;
}

export function awarenessKeyPrefix(key: string): string {
  return `${YJSKey(key)}/awareness/`;
}
export function YJSKey(key: string): string {
  return `yjs/${key}`;
}
