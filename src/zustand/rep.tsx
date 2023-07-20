import { enableMapSet, produce } from "immer";
import { create } from "zustand";

import { Replicache } from "replicache";
import { z } from "zod";
import { UpdateQueue, WorkUpdates } from "../types/types";
import { UserMutators } from "~/repl/client/mutators/user";
import { QuestMutators } from "~/repl/client/mutators/quest";
import { GlobalChatMutators } from "~/repl/client/mutators/global-chat";
enableMapSet();

interface ReplicacheState {
  publishedQuestsRep: Replicache<QuestMutators> | null;
  setPublishedQuestsRep: (rep: Replicache<QuestMutators> | null) => void;
  globalRep: Replicache<UserMutators> | null;
  setGlobalRep: (rep: Replicache<UserMutators> | null) => void;
  globalChatRep: Replicache<GlobalChatMutators> | null;

  setGlobalChatRep: (rep: Replicache<GlobalChatMutators> | null) => void;
}

export const ReplicacheInstancesStore = create<ReplicacheState>((set, get) => ({
  publishedQuestsRep: null,
  setPublishedQuestsRep: (rep) => set({ publishedQuestsRep: rep }),
  globalRep: null,
  setGlobalRep: (rep) => set({ globalRep: rep }),
  globalChatRep: null,
  setGlobalChatRep: (rep) => set({ globalChatRep: rep }),
}));
