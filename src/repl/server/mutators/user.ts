import { currentUser } from "@clerk/nextjs";
import { z } from "zod";
import { Mutation } from "~/app/api/replicache-push/route";
import { userKey } from "~/repl/client/mutators/user";
import { getItem } from "~/repl/data";
import { ReplicacheTransaction } from "~/repl/transaction";
import { UpdateUserAttributesZod, User, UserZod } from "~/types/types";

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
    const user = await currentUser();
    if (user) {
      const args = z.object({ username: z.string() }).parse(mutation.args);
      const userParams = UserZod.parse({
        id: userId,
        balance: 0,
        createdAt: new Date().toISOString(),
        experience: 0,
        role: "USER",
        level: 0,
        email: user.emailAddresses[0]?.emailAddress,
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
  }
  if (mutation.name === "updateUser") {
    const args = UpdateUserAttributesZod.parse(mutation.args);
    if (args.links && args.links.length > 0) {
      const user = (await getItem({
        PK: `USER#${userId}`,
        key: `USER#${userId}`,
        spaceId,
      })) as User | undefined;
      if (user) {
        tx.update({
          key: userKey(userId),
          value: {
            ...args,
            ...(args.links &&
              args.links.length > 0 && {
                links: user.links ? [...user.links, ...args.links] : args.links,
              }),
          },
        });
      }
    } else {
      tx.update({
        key: userKey(userId),
        value: args,
      });
    }
  }
};
