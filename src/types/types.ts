import { Content } from "next/font/google";
import { StaticImageData } from "next/image";
import { z } from "zod";

export type ThemeType = "dark" | "light";
const Entity = [
  "USER",
  "QUEST",
  "SOLUTION",
  "COMMENT",
  "POST",
  "GUILD",
  "CONTENT",
] as const;
const SPACE_NAMES = [
  "PUBLISHED_QUESTS",
  "WORKSPSACE_LIST",
  "LEADERBOARD",
  "QUEST",
  "SOLUTION",
  "PUBLISHED_QUEST",
  "PUBLISHED_SOLUTION",
  "GUILD",
] as const;
export const SpaceNamesZod = z.enum(SPACE_NAMES);
export type SpaceNamesType = z.infer<typeof SpaceNamesZod>;
export type EntityType = typeof Entity;
const QuestStatus = ["CLOSED", "OPEN"] as const;
export const SolutionStatus = [
  "ACKNOWLEDGED",
  "REJECTED",
  "ACCEPTED",
  "POSTED",
] as const;
const UserRole = ["ADMIN", "USER"] as const;

const QuestAttributes = [
  "title",
  "topic",
  "reward",
  "subtopic",
  "slots",
  "deadline",
  "content",
  "lastUpdated",
] as const;
export const Topics = [
  "MARKETING",
  "BUSINESS",
  "PROGRAMMING",
  "SCIENCE",
  "DESIGN",
  "ART",
  "VIDEOGRAPHY",
  "GAMING",
] as const;

export const TopicsObject = {
  MARKETING: {
    SOCIAL_MEDIA: false,
  },
  PROGRAMMING: {
    MACHINE_LEARNING: false,
    WEB_DEVELOPMENT: false,
    FRONT_END: false,
    BACK_END: false,
  },
  BUSINESS: {
    FINANCE: false,
    TRADING: false,
  },
};

export type QuestAttributesType = typeof QuestAttributes;
export const Subtopics = ["SOCIAL MEDIA", "MACHINE LEARNING", "WEB3"] as const;
const TopicsZod = z.enum(Topics);
export type TopicsType = z.infer<typeof TopicsZod>;
export type SubtopicsType = typeof Subtopics;

export const UserZod = z.object({
  profile: z.optional(z.string()),
  verified: z.boolean(),
  id: z.string(),
  username: z.string().min(2, { message: "Username is too short" }),
  email: z.string().email(),
  role: z.enum(UserRole),
  about: z.optional(z.string()),
  balance: z.number(),
  level: z.number(),
  experience: z.number(),
  topics: z.optional(z.array(z.enum(Topics))),
  subtopics: z.optional(z.array(z.string())),
  guildId: z.optional(z.string()),
  createdAt: z.string(),
  type: z.enum(Entity),
  questsSolved: z.optional(z.number()),
  rewarded: z.optional(z.number()),
  links: z.optional(z.object({ twitter: z.string(), discord: z.string() })),
});
export type User = z.infer<typeof UserZod>;
export const UserDynamoZod = UserZod.extend({
  PK: z.string(),
  SK: z.string(),
});
export type UserDynamo = z.infer<typeof UserDynamoZod>;
export const UserComponentZod = UserZod.pick({
  id: true,
  profile: true,
  verified: true,
  username: true,
  level: true,
});
export type UserComponent = z.infer<typeof UserComponentZod>;
export const CreateUserZod = UserZod.pick({
  username: true,
});

export type CreateUser = z.infer<typeof CreateUserZod>;

const QuestPartialZod = z
  .object({
    id: z.string(),
    title: z.string(),
    topic: z.enum(Topics),
    subtopic: z.array(z.string()),
    reward: z.number(),

    slots: z.number(),
    creatorId: z.string(),
    createdAt: z.string(),
    published: z.boolean(),
    publishedAt: z.string(),
    inTrash: z.boolean(),
    deadline: z.string(),
    lastUpdated: z.string(),
    allowUnpublish: z.optional(z.boolean()),
    type: z.enum(Entity),
  })
  .partial();

const QuestRequiredZod = QuestPartialZod.required();
export const QuestZod = QuestPartialZod.required({
  id: true,
  published: true,
  createdAt: true,
  creatorId: true,
  inTrash: true,
  lastUpdated: true,
  type: true,
  spaceId: true,
  version: true,
});
export type Quest = z.infer<typeof QuestZod>;

export const PublishedQuestZod = QuestRequiredZod.extend({
  creatorProfile: z.optional(z.string()),
  creatorUsername: z.string(),
  winnerId: z.optional(z.string()),
  status: z.enum(QuestStatus),
  solverCount: z.number(),
  content: z.optional(z.instanceof(Uint8Array)),
  text: z.string(),
  _event_time: z.optional(z.string()),
}).omit({
  inTrash: true,
  createdAt: true,
  allowUnpublish: true,
});
export type PublishedQuest = z.infer<typeof PublishedQuestZod>;

export const QuestDynamoZod = QuestZod.extend({
  PK: z.string(),
  SK: z.string(),
});
export type QuestDynamo = z.infer<typeof QuestDynamoZod>;
export interface PublishedQuestDynamo extends PublishedQuest {
  PK: string;
  SK: string;
}

export type QuestListComponent = Pick<
  Quest,
  "id" | "title" | "topic" | "inTrash" | "lastUpdated" | "type"
>;
export type Versions = {
  server: string;
  local: string;
};
export const SolverZod = z.object({
  id: z.string(),
  level: z.number(),
  experience: z.number(),
  profile: z.string(),
  username: z.string(),
  solutionId: z.optional(z.string()),
  status: z.optional(z.enum(SolutionStatus)),
});
export type Solver = z.infer<typeof SolverZod>;
export interface SolverDynamo extends Solver {
  PK: string;
  SK: string;
}
export const SolverPartialZod = SolverZod.pick({
  id: true,
  solutionId: true,
  status: true,
});
export type SolverPartial = z.infer<typeof SolverPartialZod>;

export const WorkUpdateZod = QuestZod.pick({
  title: true,
  topic: true,
  subtopic: true,
  reward: true,
  slots: true,
  deadline: true,
  lastUpdated: true,
}).partial();

export type WorkUpdate = z.infer<typeof WorkUpdateZod>;

export const UpdateQueueZod = z.map(z.string(), WorkUpdateZod);
export type UpdateQueue = z.infer<typeof UpdateQueueZod>;
export const PublishedQuestsInputZod = z.object({
  topic: z.optional(z.array(z.string())),
  subtopic: z.optional(z.array(z.string())),
  filter: z.optional(z.enum(["more views", "highest reward", "latest"])),
  cursor: z.optional(z.string()),
  limit: z.optional(z.number()),
});
export type PublishedQuestsInput = z.infer<typeof PublishedQuestsInputZod>;
export const UpdateUserAttributesZod = UserZod.pick({
  about: true,
  username: true,
  email: true,
  topics: true,
  subtopics: true,
  links: true,
})
  .partial()
  .required({ username: true });
export type UpdateUserAttributes = z.infer<typeof UpdateUserAttributesZod>;
export const UpdateInventoryZod = z.object({
  inventory: z.instanceof(Uint8Array),
  activeSlots: z.instanceof(Uint8Array),
  profile: z.string(),
  lastUpdated: z.string(),
  username: z.string(),
});
export type UpdateInventory = z.infer<typeof UpdateInventoryZod>;

const SolutionPartialZod = z
  .object({
    id: z.string(),
    content: z.instanceof(Uint8Array),
    creatorId: z.string(),
    topic: z.enum(Topics),
    contributors: z.set(z.string()),
    inTrash: z.boolean(),
    createdAt: z.string(),
    published: z.boolean(),
    publishedAt: z.string(),
    questId: z.string(),
    title: z.string(),
    lastUpdated: z.string(),
    viewed: z.boolean(),
    text: z.optional(z.instanceof(Uint8Array)),
    questCreatorId: z.string(),
    type: z.enum(Entity),
  })
  .partial();
export const SolutionZod = SolutionPartialZod.required({
  id: true,
  creatorId: true,
  published: true,
  inTrash: true,
  lastUpdated: true,
  createdAt: true,
  type: true,
});
export type Solution = z.infer<typeof SolutionZod>;
export const PublishedSolutionZod = SolutionPartialZod.omit({
  inTrash: true,
  createdAt: true,
})
  .required()
  .extend({
    status: z.optional(z.enum(SolutionStatus)),
    content: z.optional(z.instanceof(Uint8Array)),
    viewed: z.optional(z.boolean()),
    text: z.string(),
  })
  .partial({ contributors: true, topic: true });
export type PublishedSolution = z.infer<typeof PublishedSolutionZod>;
export const SolutionDynamoZod = SolutionZod.extend({
  PK: z.string(),
  SK: z.string(),
});
export type SolutionDynamo = z.infer<typeof SolutionDynamoZod>;
export type SolutionListComponent = Pick<
  Solution,
  "id" | "title" | "topic" | "lastUpdated" | "inTrash" | "type"
>;
export const ContentZod = z.object({
  content: z.instanceof(Uint8Array),
  text: z.instanceof(Uint8Array),
  inTrash: z.boolean(),
  type: z.enum(Entity),
});
export type PostListComponent = Pick<
  Post,
  "id" | "title" | "topic" | "lastUpdated" | "inTrash" | "type"
>;
export type Content = z.infer<typeof ContentZod>;
export type WorkspaceList = {
  quests: QuestListComponent[];
  solutions: SolutionListComponent[];
  posts: PostListComponent[];
};
export const CommentZod = z.object({
  questId: z.string(),
  id: z.string(),
  creatorId: z.string(),
  createdAt: z.string(),
  text: z.string(),
  upvote: z.number(),

  type: z.enum(Entity),
});
export type Comment = z.infer<typeof CommentZod>;
export interface CommentDynamo extends Comment {
  PK: string;
  SK: string;
}
export const AddCommentZod = z.object({
  questId: z.string(),
  commentId: z.string(),
  text: z.string(),
});
export type Message = {
  id: string;
  message: string;
  user_id: string;
  created_at: Date;
  profile: string;
  username: string;
  level: number;
  channel: TopicsType | "GENERAL";
};

export const PostZod = z.object({
  id: z.string(),
  title: z.string(),
  topic: z.enum(Topics),
  publishedAt: z.string(),
  content: z.optional(z.instanceof(Uint8Array)),
  text: z.string(),
  type: z.enum(Entity),
  inTrash: z.boolean(),
  lastUpdated: z.string(),
});
export type Post = z.infer<typeof PostZod>;

export type LeaderboardType = Pick<
  User,
  "username" | "level" | "profile" | "questsSolved" | "rewarded" | "profile"
> & {
  position: number;

  filter: "quests" | "reward";
};

type Slot = string | StaticImageData | null;
export interface ActiveSlots {
  hat: Slot;
  glasses: Slot;
  hair: Slot;
  upper: Slot;
  eyes: Slot;
  lower: Slot;
  skin: Slot;
}
export interface InventorySlot {
  item: string | StaticImageData | null;
  index: number;
  type?: "hat" | "glasses" | "hair" | "upper" | "eyes" | "lower" | "skin";
}

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];
export const getEntries = <T extends object>(obj: T) =>
  Object.entries(obj) as Entries<T>;

const InventoryZod = z.object({
  inventory: z.instanceof(Uint8Array),
  activeSlots: z.optional(z.instanceof(Uint8Array)),
  lastUpdated: z.string(),
});
export type Inventory = z.infer<typeof InventoryZod>;

export type SpaceVersion = {
  spaceId: string;
  version: number;
};

export type LastMutationId = {
  clientId: string;
  lastMutationId: number;
};
