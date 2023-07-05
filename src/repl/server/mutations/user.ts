import { User } from "@clerk/nextjs/dist/types/server";
import { z } from "zod";
import { Mutation } from "~/app/api/replicache-push/route";
import { userKey } from "~/repl/mutators/user";
import { ReplicacheTransaction } from "~/repl/transaction";
import { UpdateUserAttributesZod, UserZod } from "~/types/types";

export const UserMutations = async ({
  tx,
  mutation,
  spaceId,
  user,
}: {
  tx: ReplicacheTransaction;
  mutation: Mutation;
  spaceId: string;
  user: User;
  // eslint-disable-next-line @typescript-eslint/require-await
}) => {
  if (mutation.name === "createUser") {
    const args = z.object({ username: z.string() }).parse(mutation.args);
    const userParams = UserZod.parse({
      id: user.id,
      balance: 0,
      createdAt: new Date().toISOString(),
      experience: 0,
      role: "USER",
      level: 0,
      email: user.emailAddresses[0]!.emailAddress,
      username: args.username,
      verified: false,
      type: "USER",
      version: 2,
    });
    tx.put({
      key: userKey(user.id),
      value: userParams,
    });
  }
  if (mutation.name === "updateUser") {
    const args = UpdateUserAttributesZod.parse(mutation.args);

    tx.update({
      key: userKey(user.id),
      value: args,
    });
  }
};
