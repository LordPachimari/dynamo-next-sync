/* eslint-disable @typescript-eslint/require-await */
import { z } from "zod";
import { Mutation } from "~/app/api/replicache-push/route";
import { getItem } from "~/repl/data";
import { userKey } from "~/repl/mutators/user";
import { workKey } from "~/repl/mutators/workspace";
import { ReplicacheTransaction } from "~/repl/transaction";
import { PublishedQuest, User } from "~/types/types";
import { levelUp } from "~/utils/levelUp";

export const QuestMutations = async ({
  tx,
  mutation,
  spaceId,
  user,
}: {
  tx: ReplicacheTransaction;
  mutation: Mutation;
  spaceId: string;
  user: User;
}) => {
  if (mutation.name === "joinQuest") {
    const args = z
      .object({
        userId: z.string(),
        questId: z.string(),
      })
      .parse(mutation.args);
    tx.put({
      key: `SOLVER#${args.questId}#${user.id}`,
      value: {
        publishedQuestKey: args.questId,
        id: args.userId,
      },
    });
  }
  if (mutation.name === "leaveQuest") {
    const args = z
      .object({
        userId: z.string(),
        questId: z.string(),
      })
      .parse(mutation.args);
    tx.permDel({
      key: `SOLVER#${args.questId}#${user.id}`,
    });
  }
  if (mutation.name === "acceptSolution") {
    //to-do; transfer the reward to the user
    const args = z
      .object({
        solverId: z.string(),
        questId: z.string(),
        solutionId: z.string(),
      })
      .parse(mutation.args);
    const [quest, user] = (await Promise.all([
      getItem({
        key: workKey({ id: args.questId, type: "QUEST" }),
        spaceId,
        PK: `WORKSPACE#${args.solverId}`,
      }),

      getItem({
        spaceId,
        key: userKey(args.solverId),
        PK: `USER#${args.solverId}`,
      }),
    ])) as [quest: PublishedQuest | undefined, user: User | undefined];
    if (user && quest) {
      const deterministicExperience = quest.reward * 1; // multiplier
      const randomExperience = Math.floor(Math.random() * quest.reward);
      const experience = deterministicExperience + randomExperience;
      const { newExperience, newLevel } = levelUp({
        currentLevel: user.level,
        currentExperience: user.experience,
        experience,
      });
      tx.update({
        key: `SOLVER#${args.questId}#${args.solverId}`,
        value: { status: "ACCEPTED" },
      });
      tx.update({
        PK: `WORKSPACE#${args.solverId}`,
        key: workKey({ id: args.solutionId, type: "SOLUTION" }),
        value: { status: "ACCEPTED" },
      });
      tx.update({
        PK: `WORKSPACE#${args.questId}`,
        key: workKey({ id: args.questId, type: "QUEST" }),
        value: { status: "CLOSED" },
      });
      tx.update({
        PK: `USER#${args.solverId}`,
        key: userKey(args.solverId),
        value: {
          experience: newExperience,
          level: newLevel,
          questsSolved: user.questsSolved || 0 + 1,
          rewarded: user.rewarded || 0 + quest.reward,
        },
      });
    }
  }
  if (mutation.name === "acknowledgeSolution") {
    const args = z
      .object({
        solverId: z.string(),
        questId: z.string(),
        solutionId: z.string(),
      })
      .parse(mutation.args);
    const [quest, user] = (await Promise.all([
      getItem({
        key: workKey({ id: args.questId, type: "QUEST" }),
        spaceId,
        PK: `WORKSPACE#${args.solverId}`,
      }),

      getItem({
        spaceId,
        key: userKey(args.solverId),
        PK: `USER#${args.solverId}`,
      }),
    ])) as [quest: PublishedQuest | undefined, user: User | undefined];
    if (user && quest) {
      const deterministicExperience = quest.reward * 0.5; // multiplier
      const randomExperience = Math.floor(Math.random() * quest.reward);
      const experience = deterministicExperience + randomExperience;
      const { newExperience, newLevel } = levelUp({
        currentLevel: user.level,
        currentExperience: user.experience,
        experience,
      });
      tx.update({
        key: `SOLVER#${args.questId}#${args.solverId}`,
        value: { status: "ACKNOWLEDGED" },
      });
      tx.update({
        PK: `WORKSPACE#${args.solutionId}`,
        key: workKey({ id: args.solutionId, type: "SOLUTION" }),
        value: { status: "ACKNOWLEDGED" },
      });
      tx.update({
        PK: `USER#${args.solverId}`,
        key: userKey(args.solverId),
        value: {
          experience: newExperience,
          level: newLevel,
        },
      });
    }
  }

  if (mutation.name === "rejectSolution") {
    const args = z
      .object({
        solverId: z.string(),
        questId: z.string(),
        solutionId: z.string(),
      })
      .parse(mutation.args);
    tx.update({
      key: `SOLVER#${args.questId}#${args.solverId}`,
      value: { status: "REJECTED" },
    });
    tx.update({
      PK: `WORKSPACE#${args.solutionId}`,
      key: workKey({ id: args.solutionId, type: "SOLUTION" }),
      value: { status: "REJECTED" },
    });
  }
};
