/* eslint-disable @typescript-eslint/require-await */
import { z } from "zod";
import { Mutation } from "~/app/api/replicache-push/route";
import { getItem } from "~/repl/data";
import { userKey } from "~/repl/client/mutators/user";
import { workKey } from "~/repl/client/mutators/workspace";
import { ReplicacheTransaction } from "~/repl/transaction";
import { PublishedQuest, User } from "~/types/types";
import { WORKSPACE } from "~/utils/constants";
import { levelUp } from "~/utils/levelUp";

export const QuestMutators = async ({
  tx,
  mutation,
  spaceId,
  userId,
}: {
  tx: ReplicacheTransaction;
  mutation: Mutation;
  spaceId: string;
  userId?: string;
}) => {
  if (mutation.name === "joinQuest") {
    const args = z
      .object({
        userId: z.string(),
        questId: z.string(),
        publisherId: z.string(),
      })
      .parse(mutation.args);
    if (userId) {
      const [user, quest] = (await Promise.all([
        getItem({
          PK: userKey(userId),
          spaceId,
          key: userKey(userId),
        }),
        getItem({
          PK: `WORKSPACE#${args.publisherId}`,
          key: workKey({ id: args.questId, type: "QUEST" }),
          spaceId,
        }),
      ])) as [user: User | undefined, quest: PublishedQuest | undefined];

      if (user && quest) {
        tx.put({
          key: `SOLVER#${args.questId}#${userId}`,
          value: {
            publishedQuestKey: args.questId,
            id: args.userId,
            username: user.username,
            level: user.level,
            profile: user.profile,
            version:1
          },
        });

        tx.update({
          PK: `${WORKSPACE}#${args.publisherId}`,
          key: workKey({ id: args.questId, type: "QUEST" }),
          value: {
            solversCount: quest.solversCount + 1,
          },
        });
      }
    }
  }
  if (mutation.name === "leaveQuest") {
    const args = z
      .object({
        userId: z.string(),
        questId: z.string(),
        publisherId: z.string(),
      })
      .parse(mutation.args);
    const quest = (await getItem({
      PK: `${WORKSPACE}#${args.publisherId}`,
      key: workKey({ id: args.questId, type: "QUEST" }),
      spaceId,
    })) as PublishedQuest | undefined;
    if (userId && quest) {
      tx.permDel({
        key: `SOLVER#${args.questId}#${userId}`,
      });
      tx.update({
        PK: `${WORKSPACE}#${args.publisherId}`,
        key: workKey({ id: args.questId, type: "QUEST" }),
        value: {
          solversCount: quest.solversCount - 1,
        },
      });
    }
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
    if (userId) {
      const [quest, user] = (await Promise.all([
        getItem({
          key: workKey({ id: args.questId, type: "QUEST" }),
          spaceId,
          PK: `${WORKSPACE}#${userId}`,
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
          PK: `${WORKSPACE}#${args.solverId}`,
          key: workKey({ id: args.solutionId, type: "SOLUTION" }),
          value: { status: "ACCEPTED" },
        });
        tx.update({
          PK: `${WORKSPACE}#${userId}`,
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
  }
  if (mutation.name === "acknowledgeSolution") {
    const args = z
      .object({
        solverId: z.string(),
        questId: z.string(),
        solutionId: z.string(),
      })
      .parse(mutation.args);
    if (userId) {
      const [quest, user] = (await Promise.all([
        getItem({
          key: workKey({ id: args.questId, type: "QUEST" }),
          spaceId,
          PK: `${WORKSPACE}#${userId}`,
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
          PK: `${WORKSPACE}#${args.solverId}`,
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
      PK: `${WORKSPACE}#${args.solverId}`,
      key: workKey({ id: args.solutionId, type: "SOLUTION" }),
      value: { status: "REJECTED" },
    });
  }
};
