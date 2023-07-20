"use client";
import { Replicache } from "replicache";
import { env } from "~/env.mjs";
import { PUBLISHED_QUESTS } from "~/utils/constants";
import { ReplicacheInstancesStore } from "~/zustand/rep";
import Pusher from "pusher-js";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { questMutators } from "~/repl/client/mutators/quest";
export default function SettingRep() {
  const rep = ReplicacheInstancesStore((state) => state.publishedQuestsRep);
  const setRep = ReplicacheInstancesStore(
    (state) => state.setPublishedQuestsRep
  );

  const { userId } = useAuth();

  useEffect(() => {
    if (rep) {
      return;
    }

    const r = new Replicache({
      name: PUBLISHED_QUESTS,
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `/api/replicache-push?spaceId=${PUBLISHED_QUESTS}`,
      pullURL: `/api/replicache-pull?spaceId=${PUBLISHED_QUESTS}`,
      mutators: questMutators,
      pullInterval: null,
    });
    if (env.NEXT_PUBLIC_PUSHER_KEY && env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      Pusher.logToConsole = true;
      const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
      });

      const channel = pusher.subscribe(PUBLISHED_QUESTS);
      channel.bind("poke", async (data: string) => {
        const clientGroupId = await r.clientGroupID;
        if (clientGroupId !== data) r.pull();
      });
    }
    setRep(r);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rep, userId]);
  return <></>;
}
