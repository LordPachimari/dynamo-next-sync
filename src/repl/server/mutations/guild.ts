/* eslint-disable @typescript-eslint/require-await */
import { ulid } from "ulid";
import { z } from "zod";
import { Mutation } from "~/app/api/replicache-push/route";
import { getItem } from "~/repl/data";
import { guildKey, inquiryKey, notificationKey } from "~/repl/mutators/guild";
import { userKey } from "~/repl/mutators/user";
import { workKey } from "~/repl/mutators/workspace";
import { ReplicacheTransaction } from "~/repl/transaction";
import {
  CreateGuildParamsZod,
  Guild,
  Inquiry,
  InquiryZod,
  GuildInvitationZod,
  PublishedQuest,
  User,
  GuildInvitation,
} from "~/types/types";
import { GUILD } from "~/utils/constants";
import { levelUp } from "~/utils/levelUp";

export const GuildMutations = async ({
  tx,
  mutation,
  spaceId,
  user,
}: {
  tx: ReplicacheTransaction;
  mutation: Mutation;
  spaceId: string;
  user: User;
}) => {
  if (mutation.name === "createGuild") {
    const args = CreateGuildParamsZod.parse(mutation.args);
    tx.put({
      key: guildKey(args.id),
      value: args,
    });
  }
  if (mutation.name === "createMemberInquiry") {
    const inquiry = InquiryZod.parse(mutation.args);
    tx.put({ key: inquiryKey( inquiry.id), value: inquiry });
  }
  if (mutation.name === "acceptMemberInquiry") {
    const args = z
      .object({
        inquiryId: z.string(),
        guildId: z.string(),
      })
      .parse(mutation.args);
    const [guild, inquiry] = (await Promise.all([
      getItem({ key: guildKey(args.guildId), spaceId }),
      getItem({ key: inquiryKey(args.inquiryId), spaceId }),
    ])) as [guild: Guild | undefined, inquiry: Inquiry | undefined];
    if (guild && inquiry) {
      const memberIds = guild.memberIds || [];
      memberIds.push(inquiry.userId);
      tx.update({ key: guildKey(args.guildId), value: { memberIds } });
      tx.update({ key: inquiryKey(args.inquiryId), value: { status: "ACCEPTED" } });
      tx.update({
        key: userKey(inquiry.userId),
        PK: `USER#${inquiry.userId}`,
        value: { guildId: guild.id },
      });
    }
  }
  if (mutation.name === "rejectMemberInquiry") {
    //to-do; transfer the reward to the user
    const args = z
      .object({
        inquiryId: z.string(),
      })
      .parse(mutation.args);

    tx.update({ key: inquiryKey(args.inquiryId), value: { status: "ACCEPTED" } });
  }
  if (mutation.name === "inviteMember") {
    const guildInvitation = GuildInvitationZod.parse(mutation.args);
    const thirtyDayInSeconds = 30 * 24 * 60 * 60;
    const expirationTime = Math.floor(Date.now() / 1000) + thirtyDayInSeconds;
    tx.put({
      PK: userKey(guildInvitation.receiverId),
      key: notificationKey(guildInvitation.id),
      value: { ...guildInvitation, ttl: expirationTime },
    });
  }

  if (mutation.name === "acceptGuildInvitation") {
    const args = z
      .object({
        invitationId: z.string(),
        userId: z.string(),
        guildId: z.string(),
      })
      .parse(mutation.args);
    const guild = (await getItem({ key: guildKey(args.guildId), spaceId })) as
      | Guild
      | undefined;

    if (guild) {
      const memberIds = guild.memberIds || [];
      memberIds.push(args.userId);
      tx.update({
        PK: GUILD,
        key: guildKey(args.guildId),
        value: { memberIds },
      });
      tx.update({
        key: userKey(args.userId),
        value: { guildId: args.guildId },
      });
    }
  }
};
