import { WriteTransaction } from "replicache";
import {
  CreateGuildParams,
  Guild,
  GuildInvitation,
  GuildInvitationZod,
  Inquiry,
  InquiryZod,
  User,
} from "~/types/types";
import { userKey } from "./user";
export const guildKey = (id: string) => {
  return `GUILD#${id}`;
};
export const notificationKey = (id: string) => {
  return `NOTIFICATION#${id}`;
};
export const inquiryKey = (id: string) => {
  return `INQUIRY#${id}`;
};
export type GuildMutators = typeof guildMutators;
export const guildMutators = {
  createGuild: async (tx: WriteTransaction, props: CreateGuildParams) => {
    await tx.put(guildKey(props.id), props);
  },
  createMemberInquiry: (tx: WriteTransaction, inquiry: Inquiry) => {
    InquiryZod.parse(inquiry);
    return;
  },

  acceptMemberInquiry: async (
    tx: WriteTransaction,
    { inquiryId, guildId }: { inquiryId: string; guildId: string }
  ) => {
    const inquiry = (await tx.get(inquiryKey(inquiryId))) as
      | Inquiry
      | undefined;
    if (inquiry) {
      const guild = (await tx.get(guildKey(guildId))) as Guild | undefined;
      if (guild) {
        const membersIds = guild.memberIds || [];
        membersIds.push(inquiry.userId);
        await Promise.all([
          tx.put(guildKey(inquiry.guildId), guild),
          tx.put(inquiryKey(inquiryId), { ...inquiry, status: "ACCEPTED" }),
        ]);
      }
    }
  },
  rejectMemberInquiry: async (
    tx: WriteTransaction,
    { inquiryId, guildId }: { inquiryId: string; guildId: string }
  ) => {
    const inquiry = (await tx.get(inquiryKey(inquiryId))) as
      | Inquiry
      | undefined;
    if (inquiry) {
      await tx.put(inquiryKey(inquiryId), { ...inquiry, status: "REJECTED" });
    }
  },
  inviteMember: (tx: WriteTransaction, invitation: GuildInvitation) => {
    //server only function
    GuildInvitationZod.parse(invitation);
    return;
  },
  acceptGuildInvitation: async (
    tx: WriteTransaction,
    { invitationId, userId }: { invitationId: string; userId: string }
  ) => {
    const [invitation, user] = (await Promise.all([
      tx.get(invitationId),
      tx.get(userKey(userId)),
    ])) as [invitation: GuildInvitation | undefined, user: User | undefined];
    if (invitation && user) {
      await tx.put(userKey(userId), { ...user, guildId: invitation.guildId });
    }
  },
};
