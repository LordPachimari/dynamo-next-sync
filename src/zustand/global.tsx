import { enableMapSet, produce } from "immer";
import { create } from "zustand";

import { Replicache } from "replicache";
import { z } from "zod";
import { UpdateQueue, User, WorkUpdates } from "../types/types";
import { UserMutators } from "~/repl/client/mutators/user";
import { QuestMutators } from "~/repl/client/mutators/quest";
enableMapSet();

interface GlobalState {
  user: User | null;
  setUser: (user: User) => void;
}

export const ReplicacheInstancesStore = create<GlobalState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
