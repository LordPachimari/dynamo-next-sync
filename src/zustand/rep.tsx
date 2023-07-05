import { enableMapSet, produce } from "immer";
import { create } from "zustand";

import { Replicache } from "replicache";
import { z } from "zod";
import { M } from "~/repl/mutators";
import { UpdateQueue, WorkUpdates } from "../types/types";
enableMapSet();

interface ReplicacheState {
  publishedQuestsRep: Replicache<M> | null;
  setPublishedQuestsRep: (rep: Replicache<M> | null) => void;
  globalRep: Replicache<M> | null;
  setGlobalRep: (rep: Replicache<M> | null) => void;
}

export const ReplicacheInstancesStore = create<ReplicacheState>((set, get) => ({
  publishedQuestsRep: null,
  setPublishedQuestsRep: (rep) => set({ publishedQuestsRep: rep }),
  globalRep: null,
  setGlobalRep: (rep) => set({ globalRep: rep }),
}));
