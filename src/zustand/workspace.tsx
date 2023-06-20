import { enableMapSet, produce } from "immer";
import { create } from "zustand";

import {
  Quest,
  QuestListComponent,
  Solution,
  SolutionListComponent,
  QuestAttributesType,
  UpdateQueue,
  WorkUpdates,
  WorkspaceList,
} from "../types/types";
import { z } from "zod";
import { Replicache } from "replicache";
import { M } from "~/repl/mutators";
enableMapSet();

const AttributeErrorZod = z.object({
  error: z.boolean(),
  message: z.optional(z.string()),
});
export type AttributeError = z.infer<typeof AttributeErrorZod>;
export const UpdateAttributeErrorsZod = z
  .object({
    title: AttributeErrorZod,
    topic: AttributeErrorZod,
    subtopic: AttributeErrorZod,
    reward: AttributeErrorZod,
    slots: AttributeErrorZod,
    content: AttributeErrorZod,
    deadline: AttributeErrorZod,
  })
  .partial();
type AttributeErrors = {
  title: AttributeError;
  topic: AttributeError;
  subtopic: AttributeError;
  reward: AttributeError;
  slots: AttributeError;
  content: AttributeError;
  deadline: AttributeError;
};
type UpdateAttributeErrors = z.infer<typeof UpdateAttributeErrorsZod>;
interface WorkspaceState {
  rep: Replicache<M> | null;
  setRep: (rep: Replicache<M> | null) => void;
  updateQueue: UpdateQueue;
  addUpdate: (props: { id: string; value: WorkUpdates }) => void;
  clearQueue: () => void;
  attributeErrors: AttributeErrors;
  setAttributeErrors: (attributesErrors: UpdateAttributeErrors) => void;
}

export const WorkspaceStore = create<WorkspaceState>((set, get) => ({
  rep: null,
  setRep: (rep) => set({ rep }),
  attributeErrors: {
    title: { error: false },
    content: { error: false },
    slots: { error: false },
    topic: { error: false },
    subtopic: { error: false },
    reward: { error: false },
    deadline: { error: false },
  },
  setAttributeErrors: (newAttributeErrors) => {
    const currentErrors = structuredClone(get().attributeErrors);
    const newErrors = { ...currentErrors, ...newAttributeErrors };
    console.log("newErrors from zustand", newErrors);

    set({ attributeErrors: newErrors });
  },
  workspaceList: { quests: [], solutions: [], posts: [] },
  updateQueue: new Map(),

  addUpdate: (props) =>
    set(
      produce((state: WorkspaceState) => {
        const { id, value } = props;
        const existingChanges = state.updateQueue.get(id);
        state.updateQueue.set(id, { ...existingChanges, ...value });
      })
    ),
  clearQueue: () =>
    set(
      produce((state: WorkspaceState) => {
        state.updateQueue.clear();
      })
    ),
}));
