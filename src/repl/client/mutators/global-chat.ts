import { WriteTransaction } from "replicache";
import { ChannelType, ChannelZod, Message, MessageZod } from "~/types/types";
import { messageKey } from "~/utils/constants";

export type GlobalChatMutators = typeof globalChatMutators;

export const globalChatMutators = {
  createMessage: async (tx: WriteTransaction, message: Message) => {
    const messageParams = MessageZod.parse(message);

    await tx.put(
      messageKey(messageParams.id, messageParams.channel),
      messageParams
    );
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  updateChannel: async (tx: WriteTransaction, channel: ChannelType) => {
    const parsedChannel = ChannelZod.parse(channel);
  },
};
