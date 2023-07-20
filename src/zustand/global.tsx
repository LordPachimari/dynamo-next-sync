import { enableMapSet, produce } from "immer";
import { create } from "zustand";

import { Replicache } from "replicache";
import { z } from "zod";
import { ChannelType, UpdateQueue, User, WorkUpdates } from "../types/types";
import { UserMutators } from "~/repl/client/mutators/user";
import { QuestMutators } from "~/repl/client/mutators/quest";
import { GlobalChatMutators } from "~/repl/client/mutators/global-chat";
enableMapSet();

interface GlobalState {
  channel: ChannelType;
  setChannel: (channel: ChannelType) => void;
}

export const GlobalStore = create<GlobalState>((set, get) => ({
  channel: "GENERAL",
  setChannel: (channel) => set({ channel }),
}));
