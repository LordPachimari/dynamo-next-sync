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
} from "~/types/types";

export type M = typeof mutators;
export const mutators = {
  createWork: async (tx: WriteTransaction, { work }: { work: WorkType }) => {
    console.log("mutators, putQuest");
    const parsedWork = WorkZod.parse(work);

    await tx.put(`${editorKey(work.id)}`, parsedWork);
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
    const content = (await tx.get(`${YJSKey(id)}`)) as string;

    if (work && content) {
      await tx.put(`${editorKey(newId)}`, {
        id: newId,
        createdAt,
        lastUpdated,
      });
      await tx.put(`${YJSKey(newId)}`, content);
    }
  },
  deleteWork: async (tx: WriteTransaction, { id }: { id: string }) => {
    console.log("mutators, deleteWork");
    const work = (await tx.get(`${editorKey(id)}`)) as
      | MergedWorkType
      | undefined;
    if (work) {
      await tx.put(`${editorKey(id)}`, { ...work, inTrash: true });
    }
  },
  deleteWorkPermanently: async (
    tx: WriteTransaction,
    { id }: { id: string }
  ) => {
    console.log("mutators, perm delete");
    await tx.del(`${editorKey(id)}`);
  },
  restoreWork: async (tx: WriteTransaction, { id }: { id: string }) => {
    console.log("mutators, restore");
    const work = (await tx.get(`${editorKey(id)}`)) as
      | MergedWorkType
      | undefined;
    if (work) {
      await tx.put(`${editorKey(id)}`, { ...work, inTrash: false });
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
    await putWork(tx, { id: `${editorKey(id)}`, work: updated });
  },

  async updateYJS(
    tx: WriteTransaction,
    { key, update }: { key: string; update: { Ydoc: string } }
  ) {
    await tx.put(YJSKey(key), update);
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
export const getWork = async (tx: ReadTransaction, { id }: { id: string }) => {
  const work = await tx.get(`${editorKey(id)}`);
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

function awarenessKey(key: string, yjsClientID: number): string {
  return `${YJSKey(key)}/awareness/${yjsClientID}`;
}

export function editorKey(key: string): string {
  return `EDITOR#${key}`;
}

export function awarenessKeyPrefix(key: string): string {
  return `${YJSKey(key)}/awareness/`;
}
export function YJSKey(key: string): string {
  return `yjs/${key}`;
}
