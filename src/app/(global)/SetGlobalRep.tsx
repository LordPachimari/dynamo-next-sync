"use client";
import { Replicache } from "replicache";
import { env } from "~/env.mjs";
import { GLOBAL_CHAT, PUBLISHED_QUESTS, STRANGER, USER } from "~/utils/constants";
import { ReplicacheInstancesStore } from "~/zustand/rep";
import Pusher from "pusher-js";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { userMutators } from "~/repl/client/mutators/user";
import { GlobalStore } from "~/zustand/global";
import { globalChatMutators } from "~/repl/client/mutators/global-chat";
import ChannelTable from "pusher-js/types/src/core/channels/channel_table";
import { ChannelType } from "~/types/types";
export default function SetGlobalRep() {
  const rep = ReplicacheInstancesStore((state) => state.globalRep);
  const setRep = ReplicacheInstancesStore((state) => state.setGlobalRep);
  const globalChatRep = ReplicacheInstancesStore(
    (state) => state.globalChatRep
  );
  const setGlobalChatRep = ReplicacheInstancesStore(
    (state) => state.setGlobalChatRep
  );
  const globalChatChannel = GlobalStore((state) => state.channel);

  const { userId } = useAuth();

  useEffect(() => {
    if (rep) {
      return;
    }

    const r = new Replicache({
      name: `${USER}#${userId ? userId : STRANGER}`,
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `/api/replicache-push?spaceId=${USER}`,
      pullURL: `/api/replicache-pull?spaceId=${USER}`,
      mutators: userMutators,
      pullInterval: null,
    });

    if (env.NEXT_PUBLIC_PUSHER_KEY && env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      Pusher.logToConsole = true;
      const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
      });

      const channel = pusher.subscribe(`${USER}${userId ? userId : STRANGER}`);
      channel.bind("poke", async (data: string) => {
        const clientGroupID = await r.clientGroupID;
        if (clientGroupID !== data) {
          r.pull();
        }
      });
    }
    setRep(r);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rep, userId]);
  useEffect(() => {
    if (rep) {
      return;
    }

    const r = new Replicache({
      name: "GLOBAL_CHAT",
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `/api/replicache-push?spaceId=${GLOBAL_CHAT}`,
      pullURL: `/api/replicache-pull?spaceId=${GLOBAL_CHAT}`,
      mutators: globalChatMutators,
      pullInterval: null,
    });

    if (env.NEXT_PUBLIC_PUSHER_KEY && env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      Pusher.logToConsole = true;
      const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
      });

      const pusherChannel = pusher.subscribe(GLOBAL_CHAT);
      pusherChannel.bind("poke", async (data: string) => {
        const {clientGroupID, channel} = JSON.parse(data) as {clientGroupID:string, channel:ChannelType}
        const groupId = await r.clientGroupID;

        if (clientGroupID !== groupId && channel ===globalChatChannel) {
          r.pull();
        }
      });
    }
    setGlobalChatRep(r);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rep]);
  return <></>;
}
