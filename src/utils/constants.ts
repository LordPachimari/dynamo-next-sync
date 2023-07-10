import { User } from "~/types/types";

export const WORKSPACE = "WORKSPACE";
export const PUBLISHED_QUESTS = "PUBLISHED_QUESTS";
export const GUILD = "GUILD";
export const LEADERBOARD = "LEADERBOARD";
export const USER = "USER";
export const default_user: User = {
  id: "user1",
  balance: 0,
  createdAt: new Date().toISOString(),
  email: "ajdw",
  experience: 0,
  level: 0,
  role: "ADMIN" as const,
  type: "USER" as const,
  username: "RANDOM USER",
  verified: false,
  version: 1,
};
