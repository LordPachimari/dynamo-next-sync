import { enableMapSet, produce } from "immer";
import { create } from "zustand";

import {
  Quest,
  QuestListComponent,
  Solution,
  SolutionListComponent,
  QuestAttributesType,
  UpdateQueue,
  WorkUpdate,
  WorkspaceList,
} from "../types/types";
enableMapSet();

interface WorkspaceState {
  updateQueue: UpdateQueue;
  addUpdate: (props: { id: string; value: WorkUpdate }) => void;
  clearQueue: () => void;
  workspaceList: WorkspaceList;
  createWork: ({
    id,
    type,
    userId,
  }: {
    id: string;
    type: "QUEST" | "SOLUTION";
    userId: string;
  }) => void;
  deleteWork: ({
    id,
    type,
  }: {
    id: string;
    type: "QUEST" | "SOLUTION";
  }) => void;
  setWorkspaceList: ({
    quests,
    solutions,
  }: {
    quests?: QuestListComponent[];
    solutions?: SolutionListComponent[];
  }) => void;
  updateListState: <
    Attr extends "title" | "topic",
    Value extends QuestListComponent[Attr]
  >(props: {
    type: "QUEST" | "SOLUTION";
    id: string;
    attribute: Attr;
    value: Value;
  }) => void;
}

export const WorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaceList: { quests: [], solutions: [], posts: [] },
  updateQueue: new Map(),

  addUpdate: (props) =>
    set(
      produce((state: WorkspaceState) => {
        const { id, value } = props;
        state.updateQueue.set(id, value);
      })
    ),
  clearQueue: () =>
    set(
      produce((state: WorkspaceState) => {
        state.updateQueue.clear();
      })
    ),
  createWork: ({ id, type, userId }) => {
    const newDate = new Date().toISOString();
    if (type === "QUEST") {
      const quest: Quest = {
        id,
        published: false,
        inTrash: false,
        createdAt: newDate,
        creatorId: userId,
        lastUpdated: newDate,
        type: "QUEST",
      };
      set(
        produce((state: WorkspaceState) => {
          state.workspaceList.quests.push(quest);
        })
      );
    } else if (type === "SOLUTION") {
      const solution: Solution = {
        id,
        createdAt: new Date().toISOString(),
        creatorId: userId,
        inTrash: false,
        published: false,
        type: "SOLUTION",
        lastUpdated: new Date().toISOString(),
      };
      set(
        produce((state: WorkspaceState) => {
          state.workspaceList.solutions.push(solution);
        })
      );
    }
  },

  deleteWork: ({ id, type }) => {
    if (type === "QUEST") {
      const quests = get().workspaceList.quests;
      const filteredQuests = quests.filter((q) => q.id !== id);
      set(
        produce((state: WorkspaceState) => {
          state.workspaceList.quests = filteredQuests;
        })
      );
    } else if (type === "SOLUTION") {
      const solutions = get().workspaceList.solutions;

      const filteredSolutions = solutions.filter((s) => s.id !== id);
      set(
        produce((state: WorkspaceState) => {
          state.workspaceList.solutions = filteredSolutions;
        })
      );
    }
  },

  setWorkspaceList: ({ solutions, quests }) =>
    set(
      produce((state: WorkspaceState) => {
        if (quests && solutions) {
          state.workspaceList.quests = quests;
          state.workspaceList.solutions = solutions;
        } else if (quests) {
          state.workspaceList.quests = quests;
        } else if (solutions) {
          state.workspaceList.solutions = solutions;
        }
      })
    ),

  updateListState: ({ id, attribute, value, type }) =>
    set(
      produce((state: WorkspaceState) => {
        if (type === "QUEST") {
          const index = state.workspaceList.quests.findIndex(
            (q) => q.id === id
          );
          if (index < 0) {
            return;
          }

          const quest = state.workspaceList.quests[index];
          if (quest) {
            quest[attribute] = value;
            state.workspaceList.quests[index] = quest;
          }
        }
        if (type === "SOLUTION") {
          const index = state.workspaceList.solutions.findIndex(
            (q) => q.id === id
          );
          if (index < 0) {
            return;
          }
          const solution = state.workspaceList.solutions[index];
          if (solution) {
            solution[attribute] = value;
            state.workspaceList.solutions[index] = solution;
          }
        }
      })
    ),
}));
