import { WriteTransaction } from "replicache";
import { z } from "zod";
import {
  MergedWorkType,
  UpdateUserAttributes,
  UpdateUserAttributesZod,
  User,
  UserZod,
  WorkType,
} from "~/types/types";

export function userKey(id: string) {
  return `USER#${id}`;
}

export const userMutators = {
  createUser: async (
    tx: WriteTransaction,
    {
      username,
      userId,
      email,
    }: { username: string; userId: string; email: string }
  ) => {
    console.log("mutators, put user");
    const userParams = UserZod.parse({
      id: userId,
      balance: 0,
      createdAt: new Date().toISOString(),
      experience: 0,
      role: "USER",
      level: 0,
      email,
      username: username,
      verified: false,
      type: "USER",
      version: 1,
    });

    await tx.put(userKey(userId), userParams);
  },
  updateUser: async (
    tx: WriteTransaction,
    props: UpdateUserAttributes & { userId: string }
  ) => {
    const updateUserAttrs = UpdateUserAttributesZod.parse(props);
    const user = (await tx.get(userKey(props.userId))) as User | null;

    await tx.put(userKey(props.userId), { ...user, ...updateUserAttrs });
  },
};
