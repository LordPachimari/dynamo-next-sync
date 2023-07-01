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
  EntityType,
  PublishWorkAttributesType,
} from "~/types/types";
export type M = typeof mutators;

export const mutators = {
  createWork: async (
    tx: WriteTransaction,
    { work, type }: { work: MergedWorkType; type: WorkType }
  ) => {
    console.log("mutators, putQuest");
    const parsedWork = WorkZod.parse(work);
    const newContent: Content = {
      type: "CONTENT",
      version: 1,
    };

    await Promise.all([
      tx.put(workKey({ id: work.id, type }), parsedWork),
      tx.put(contentKey(work.id), newContent),
    ]);
  },

  duplicateWork: async (
    tx: WriteTransaction,
    {
      id,
      newId,
      createdAt,
      lastUpdated,
      type,
    }: {
      id: string;
      newId: string;
      lastUpdated: string;
      createdAt: string;
      type: WorkType;
    }
  ) => {
    console.log("mutators, duplicateWork");
    const work = await getWork(tx, { id, type });
    const content = (await tx.get(contentKey(id))) as string;

    if (work && content) {
      await tx.put(workKey({ id: newId, type }), {
        id: newId,
        createdAt,
        lastUpdated,
      });
      await tx.put(contentKey(newId), content);
    }
  },
  publishWork: async (
    tx: WriteTransaction,
    props: PublishWorkAttributesType
  ) => {
    console.log("mutators, publishWork");
    const work = (await getWork(tx, { id: props.id, type: props.type })) as
      | MergedWorkType
      | undefined;

    if (work) {
      await tx.put(workKey({ id: props.id, type: props.type }), {
        ...work,
        ...props,
      });
    }
  },
  unpublishWork: async (
    tx: WriteTransaction,
    { id, type }: { id: string; type: WorkType }
  ) => {
    console.log("mutators, publishWork");
    const work = (await getWork(tx, { id, type })) as
      | MergedWorkType
      | undefined;
    if (work) {
      await tx.put(workKey({ id, type }), { ...work, published: false });
    }
  },
  deleteWork: async (
    tx: WriteTransaction,
    { id, type }: { id: string; type: WorkType }
  ) => {
    console.log("mutators, deleteWork");
    const work = (await getWork(tx, { id, type })) as
      | MergedWorkType
      | undefined;
    if (work) {
      await tx.put(workKey({ id, type }), { ...work, inTrash: true });
    }
  },
  deleteWorkPermanently: async (
    tx: WriteTransaction,
    { id, type }: { id: string; type: WorkType }
  ) => {
    console.log("mutators, perm delete");
    await tx.del(workKey({ id, type }));
  },
  restoreWork: async (
    tx: WriteTransaction,
    { id, type }: { id: string; type: WorkType }
  ) => {
    console.log("mutators, restore");
    const work = (await tx.get(workKey({ id, type }))) as
      | MergedWorkType
      | undefined;
    if (work) {
      await tx.put(workKey({ id, type }), { ...work, inTrash: false });
    }
  },
  updateWork: async (
    tx: WriteTransaction,
    {
      id,

      updates,
      type,
    }: {
      id: string;
      updates: WorkUpdates;
      type: WorkType;
    }
  ): Promise<void> => {
    const work = (await getWork(tx, { id, type })) as Quest;
    if (!work) {
      console.info(`Quest ${id} not found`);
      return;
    }
    const updated = { ...work, ...updates };
    await putWork(tx, { id, work: updated, type });
  },

  async updateContent(
    tx: WriteTransaction,
    {
      id,
      update,
    }: { id: string; update: { Ydoc: string; textContent?: string } }
  ) {
    const prevYJS = await getContent(tx, { id });

    const updated = { ...prevYJS, ...update };
    await tx.put(contentKey(id), updated);
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
export const getContent = async (
  tx: ReadTransaction,
  { id }: { id: string }
) => {
  const content = await tx.get(contentKey(id));
  if (!content) {
    return undefined;
  }
  return content as Content;
};
export const getWork = async (
  tx: ReadTransaction,
  { id, type }: { id: string; type: WorkType }
) => {
  const work = await tx.get(workKey({ id, type }));
  if (!work) {
    return undefined;
  }
  return work;
};
export const putWork = async (
  tx: WriteTransaction,
  { work, id, type }: { work: ReadonlyJSONValue; id: string; type: WorkType }
) => {
  await tx.put(workKey({ id, type }), work);
};

function awarenessKey(key: string, yjsClientID: number): string {
  return `${contentKey(key)}/awareness/${yjsClientID}`;
}

export function workKey({
  id,
  type,
}: {
  id: string;
  type: "QUEST" | "SOLUTION" | "POST";
}): string {
  if (type === "QUEST") return `WORK#QUEST#${id}`;
  if (type === "SOLUTION") return `WORK#SOLUTION#${id}`;
  if (type === "POST") return `WORK#POST#${id}`;
  return "";
}

export function awarenessKeyPrefix(key: string): string {
  return `${contentKey(key)}/awareness/`;
}
export function contentKey(key: string): string {
  return `CONTENT#${key}`;
}
