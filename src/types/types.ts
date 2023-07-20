import { Content } from "next/font/google";
import { StaticImageData } from "next/image";
import { z } from "zod";

export const WorkTypeEnum = ["POST", "QUEST", "SOLUTION"] as const;
export type ThemeType = "dark" | "light";
export const Entity = [
  "USER",
  "QUEST",
  "SOLUTION",
  "COMMENT",
  "POST",
  "GUILD",
  "CONTENT",
  "INQUIRY",
  "INVITATION",
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
export const SubtopicSuggestion = [
  "LOGO",
  "AI",
  "MACHINE LEARNING",
  "WEB",
  "MOBILE-DEV",
];
export const GuildRankings = ["NEWBIE", "MID", "LORD", "FOUNDER"] as const;
export const Destination = ["FORUM", "TALENT"] as const;
export const SpaceNamesZod = z.enum(SPACE_NAMES);
export type SpaceNamesType = z.infer<typeof SpaceNamesZod>;
export type EntityType = typeof Entity;
const QuestStatus = ["CLOSED", "OPEN"] as const;
export const SolutionStatus = [
  "ACKNOWLEDGED",
  "REJECTED",
  "ACCEPTED",
  "POSTED SOLUTION",
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
export const Channel = ["GENERAL", ...Topics] as const;
export const ChannelZod = z.enum(Channel);
export type ChannelType = z.infer<typeof ChannelZod>;
export type QuestAttributesType = typeof QuestAttributes;
export const Subtopics = ["SOCIAL MEDIA", "MACHINE LEARNING", "WEB3"] as const;
const TopicsZod = z.enum(Topics);
export type Topic = z.infer<typeof TopicsZod>;
export type Subtopics = typeof Subtopics;

export const UserZod = z.object({
  profile: z.optional(z.string()),
  verified: z.boolean(),
  id: z.string(),
  username: z.string().min(2, { message: "Username is too short" }),
  email: z.optional(z.string().email()),
  role: z.enum(UserRole),
  about: z.optional(z.string()),
  balance: z.number(),
  level: z.number(),
  experience: z.number(),
  topics: z.optional(z.array(z.enum(Topics))),
  subtopics: z.optional(z.array(z.string())),
  guildId: z.optional(z.string()),
  guildRank: z.optional(z.enum(GuildRankings)),
  createdAt: z.string(),
  type: z.enum(Entity),
  questsSolved: z.optional(z.number()),
  rewarded: z.optional(z.number()),
  links: z.optional(z.array(z.object({ value: z.string() }))),
  version: z.number(),
});
export type User = z.infer<typeof UserZod>;
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
    reward: z.number().min(1, "reward must be greater than zero"),
    version: z.number(),
    slots: z.number().min(1, "slots must be greater than zero"),
    creatorId: z.string(),
    createdAt: z.string(),
    published: z.boolean(),
    publishedAt: z.string(),
    inTrash: z.boolean(),
    deadline: z.string(),
    lastUpdated: z.string(),
    allowUnpublish: z.boolean(),
    type: z.enum(WorkTypeEnum),
    collaborators: z.array(z.string()),
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
  version: true,
});
export type Quest = z.infer<typeof QuestZod>;

export const PublishedQuestZod = QuestRequiredZod.extend({
  publisherProfile: z.optional(z.string()),
  publisherUsername: z.string(),
  winnerId: z.optional(z.string()),
  status: z.enum(QuestStatus),
  textContent: z.string(),
  verified: z.optional(z.boolean()),
  preview: z.optional(z.string()),
  solversCount: z.number(),
}).omit({
  inTrash: true,
  createdAt: true,
  allowUnpublish: true,
  collaborators: true,
});
export type PublishedQuest = z.infer<typeof PublishedQuestZod>;

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
export const SolverPartialZod = SolverZod.pick({
  id: true,
  solutionId: true,
  status: true,
});
export type SolverPartial = z.infer<typeof SolverPartialZod>;

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
}).partial();
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

    creatorId: z.string(),
    topic: z.enum(Topics),
    contributors: z.array(z.string()),
    inTrash: z.boolean(),
    createdAt: z.string(),
    published: z.boolean(),
    publishedAt: z.string(),
    questId: z.string(),
    title: z.string(),
    lastUpdated: z.string(),
    viewed: z.boolean(),
    questCreatorId: z.string(),
    type: z.enum(WorkTypeEnum),
    version: z.number(),

    collaborators: z.optional(z.array(z.string())),
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
  version: true,
});
export type Solution = z.infer<typeof SolutionZod>;
export const PublishedSolutionZod = SolutionPartialZod.omit({
  inTrash: true,
  createdAt: true,
})
  .required()
  .extend({
    status: z.optional(z.enum(SolutionStatus)),
    viewed: z.optional(z.boolean()),
    textContent: z.string(),
  })
  .partial({ contributors: true, topic: true });
export type PublishedSolution = z.infer<typeof PublishedSolutionZod>;
export const ContentZod = z.object({
  Ydoc: z.optional(z.string()),
  type: z.literal("CONTENT"),
  version: z.number(),
  collaborators: z.optional(z.string()),
});

export type Content = z.infer<typeof ContentZod>;
export const ContentUpdatesZod = ContentZod.pick({
  Ydoc: true,
  textContent: true,
});

export type ContentUpdates = z.infer<typeof ContentUpdatesZod>;
export type PublishedContent = {
  markdown: string;
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
export const AddCommentZod = z.object({
  questId: z.string(),
  commentId: z.string(),
  text: z.string(),
});
export const MessageZod = z.object({
  id: z.string(),
  message: z.string(),
  userId: z.string(),
  username: z.string(),
  createAt: z.string(),
  profile: z.optional(z.string()),
  level: z.number(),
  channel: z.enum([...Topics, "GENERAL" as const]),
  version: z.number(),
});
export type Message = z.infer<typeof MessageZod>;

export const PostZodPartial = z
  .object({
    SK: z.string(),
    id: z.string(),
    title: z.string(),
    topic: z.enum(Topics),
    publishedAt: z.string(),
    textContent: z.string(),
    type: z.enum(WorkTypeEnum),
    inTrash: z.boolean(),
    lastUpdated: z.string(),
    published: z.boolean(),
    version: z.number(),

    collaborators: z.optional(z.array(z.string())),
  })
  .partial();
export const PostZod = PostZodPartial.required({
  id: true,
  type: true,
  inTrash: true,
  lastUpdated: true,
  version: true,
});
export const PublishedPostZod = PostZodPartial.required()
  .extend({
    publisherProfile: z.optional(z.string()),
    publisherUsername: z.string(),
    textContent: z.optional(z.string()),
    verified: z.optional(z.boolean()),
    preview: z.optional(z.string()),
    destination: z.enum(["FORUM", "TALENT"] as const),
  })
  .omit({
    inTrash: true,
    createdAt: true,
    allowUnpublish: true,
  });
export type PublishedPost = z.infer<typeof PublishedPostZod>;
export type Post = z.infer<typeof PostZod>;
export const PostListComponentZod = PostZod.pick({
  id: true,
  title: true,
  topic: true,
  inTrash: true,
  type: true,
});
export type PostListComponent = z.infer<typeof PostZod>;
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
  SK: string;
  lastMutationId: number;
  version: number;
};
export const WorkZod = z.union([QuestZod, SolutionZod, PostZod]);

export type WorkType = "POST" | "QUEST" | "SOLUTION";
export type MergedWork = (Post & Quest & Solution) & {
  type: WorkType;
};
export interface PublishedMergedWork extends MergedWork {
  textContent: string;
  publishedQuestKey?: string;
}

const basePublishWorkSchema = z.object({
  id: z.string(),
  publishedAt: z.string(),
  published: z.boolean(),
  textContent: z.string(),
});

const questSchema = z.object({
  type: z.literal("QUEST"),
  status: z.union([z.literal("OPEN"), z.literal("CLOSED")]),
  solversCount: z.number(),
});

const solutionSchema = z.object({
  type: z.literal("SOLUTION"),
  questId: z.string(),
});

const postSchema = z.object({
  type: z.literal("POST"),
  destination: z.union([z.literal("FORUM"), z.literal("TALENT")]),
});

export const PublishWorkParamsZod = z.intersection(
  basePublishWorkSchema,
  z.union([questSchema, solutionSchema, postSchema])
);
export type PublishWorkParams = z.infer<typeof PublishWorkParamsZod>;

export const WorkUpdatesZod = QuestZod.pick({
  title: true,
  topic: true,
  subtopic: true,
  reward: true,
  slots: true,
  deadline: true,
  lastUpdated: true,
}).partial();

export type WorkUpdates = z.infer<typeof WorkUpdatesZod>;
export const UpdateQueueZod = z.map(z.string(), WorkUpdatesZod);
export type UpdateQueue = z.infer<typeof UpdateQueueZod>;

const mutationNames = [
  "createWork",
  "updateWork",
  "deleteWork",
  "deleteWorkPermanently",
  "duplicateWork",
  "restoreWork",
  "updateContent",
  "publishWork",
  "unpublishWork",
  "createUser",
  "updateUser",
  "joinQuest",
  "leaveQuest",
  "acceptSolution",
  "acknowledgeSolution",
  "rejectSolution",
  "createGuild",
  "acceptMemberInquiry",
  "rejectMemberInquiry",
  "inviteMember",
  "acceptGuildInvitation",
  "createMemberInquiry",
  "createMessage",
  "updateChannel"
] as const;
export const MutationNamesZod = z.enum(mutationNames);
export type MutaitonNamesType = z.infer<typeof MutationNamesZod>;
export type ClientViewRecord = {
  id: string;
  keys: Record<string, number>;
};

export const InquiryZod = z.object({
  id: z.string(),
  userId: z.string(),
  topic: z.string(),
  title: z.string(),
  message: z.string(),
  guildId: z.string(),
  createdAt: z.string(),
  status: z.optional(z.enum(["REJECTED", "ACCEPTED"] as const)),
  type: z.enum(["INQUIRY"]),
});
export type Inquiry = z.infer<typeof InquiryZod>;
export const GuildZod = z.object({
  id: z.string(),
  name: z.string(),
  specialty: z.array(z.string()),
  createdAt: z.string(),
  founderId: z.string(),
  emblem: z.optional(z.string()),
  memberIds: z.optional(z.array(z.string())),
  inquiryIds: z.optional(z.array(z.string())),
});
export const CreateGuildParamsZod = GuildZod.pick({
  id: true,
  name: true,
  emblem: true,
  specialty: true,
});
export type CreateGuildParams = z.infer<typeof CreateGuildParamsZod>;
export type Guild = z.infer<typeof GuildZod>;
export const GuildInvitationZod = z.object({
  id: z.string(),
  senderId: z.string(),
  title: z.string(),
  message: z.string(),
  sentAt: z.string(),
  guildId: z.string(),
  receiverId: z.string(),
  type: z.enum(["INVITATION"]),
});
export type GuildInvitation = z.infer<typeof GuildInvitationZod>;
