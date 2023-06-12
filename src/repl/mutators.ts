import type { ReadTransaction, WriteTransaction } from "replicache";

import { QUEST_PREFIX } from "../utils/constants";
import type { Quest, WorkUpdates } from "~/types/types";

export type M = typeof mutators;
export const mutators = {
  createQuest: async (tx: WriteTransaction, { quest }: { quest: Quest }) => {
    console.log("mutators, putQuest");
    await tx.put(`${QUEST_PREFIX}${quest.id}`, quest);
  },

  deleteQuest: async (tx: WriteTransaction, { id }: { id: string }) => {
    console.log("mutators, deleteQuest");
    await tx.del(`${QUEST_PREFIX}${id}`);
  },
  updateQuest: async (
    tx: WriteTransaction,
    {
      id,

      updates,
    }: {
      id: string;
      updates: WorkUpdates;
    }
  ): Promise<void> => {
    const quest = (await getQuest(tx, { id })) as Quest;
    if (!quest) {
      console.info(`Quest ${id} not found`);
      return;
    }
    const updatedQuest = { ...quest, updates };
    await putQuest(tx, { id: `${QUEST_PREFIX}${id}`, quest: updatedQuest });
  },
};
export const getQuest = async (tx: ReadTransaction, { id }: { id: string }) => {
  const quest = (await tx.get(`${QUEST_PREFIX}${id}`)) as Quest;
  if (!quest) {
    return undefined;
  }
  return quest;
};
export const putQuest = async (
  tx: WriteTransaction,
  { quest, id }: { quest: Quest; id: string }
) => {
  await tx.put(id, quest);
};
export const deleteQuest = async (
  tx: WriteTransaction,
  { id }: { id: string }
) => {
  await tx.del(id);
};
