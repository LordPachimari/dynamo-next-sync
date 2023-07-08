import { User } from "@clerk/nextjs/dist/types/server";
import { z } from "zod";
import { Mutation } from "~/app/api/replicache-push/route";
import { userKey } from "~/repl/client/mutators/user";
import { ReplicacheTransaction } from "~/repl/transaction";
import { UpdateUserAttributesZod, UserZod } from "~/types/types";

export const UserMutators = async ({
  tx,
  mutation,
  spaceId,
  userId,
}: {
  tx: ReplicacheTransaction;
  mutation: Mutation;
  spaceId: string;
  userId: string;
  // eslint-disable-next-line @typescript-eslint/require-await
}) => {
  if (mutation.name === "createUser") {
    const args = z
      .object({ username: z.string(), email: z.string() })
      .parse(mutation.args);
    const userParams = UserZod.parse({
      id: userId,
      balance: 0,
      createdAt: new Date().toISOString(),
      experience: 0,
      role: "USER",
      level: 0,
      email: args.email,
      username: args.username,
      verified: false,
      type: "USER",
      version: 2,
    });
    tx.put({
      key: userKey(userId),
      value: userParams,
    });
  }
  if (mutation.name === "updateUser") {
    const args = UpdateUserAttributesZod.parse(mutation.args);
    tx.update({
      key: userKey(userId),
      value: args,
    });
  }
};
