import { questMutators } from "./quest";
import { userMutators } from "./user";
import { wokrspaceMutators } from "./workspace";
import { guildMutators } from "./guild";
export type M = typeof mutators;

export const mutators = {
  ...wokrspaceMutators,
  ...userMutators,
  ...questMutators,
  ...guildMutators,
};
