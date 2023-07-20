import { ChannelType, User } from "~/types/types";

export const WORKSPACE = "WORKSPACE";
export const PUBLISHED_QUESTS = "PUBLISHED_QUESTS";
export const GUILD = "GUILD";
export const LEADERBOARD = "LEADERBOARD";
export const USER = "USER";
export const STRANGER = "STRANGER";
export const GLOBAL_CHAT = "GLOBAL_CHAT";
export function messageKey(id: string, channel: ChannelType) {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `MESSAGE#${channel}#${id}`;
}
export function channelKey(userId: string, channel: ChannelType) {
  return `${channel}#${userId}`;
}
