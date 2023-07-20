import { currentUser } from "@clerk/nextjs";
import { z } from "zod";
import { Mutation } from "~/app/api/replicache-push/route";
import { userKey } from "~/repl/client/mutators/user";
import { getItem } from "~/repl/data";
import { ReplicacheTransaction } from "~/repl/transaction";
import {
  ChannelZod,
  MessageZod,
  UpdateUserAttributesZod,
  User,
  UserZod,
} from "~/types/types";
import { channelKey, messageKey } from "~/utils/constants";

export const GlobalChatMutators = async ({
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
  if (mutation.name === "createMessage") {
    const message = MessageZod.parse(mutation.args);
    tx.put({
      key: messageKey(message.id, message.channel),
      value: message,
      PK: messageKey(message.id, message.channel),
    });
  }
  if (mutation.name === "updateChannel") {
    const channel = ChannelZod.parse(mutation.args);
    tx.put({
      key: channelKey(userId, channel),
      value: { channel },
      PK: channelKey(userId, channel),
    });
  }
};
