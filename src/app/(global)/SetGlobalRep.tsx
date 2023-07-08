"use client";
import { Replicache } from "replicache";
import { env } from "~/env.mjs";
import { PUBLISHED_QUESTS, USER } from "~/utils/constants";
import { ReplicacheInstancesStore } from "~/zustand/rep";
import Pusher from "pusher-js";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { userMutators } from "~/repl/client/mutators/user";
export default function SetGlobalRep() {
  const rep = ReplicacheInstancesStore((state) => state.globalRep);
  const setRep = ReplicacheInstancesStore((state) => state.setGlobalRep);

  const { userId } = useAuth();

  useEffect(() => {
    if (rep) {
      return;
    }
    if (!userId) {
      return;
    }

    const r = new Replicache({
      name: userId ? `${USER}#${userId}` : USER,
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

      const channel = pusher.subscribe(USER);
      channel.bind("poke", () => {
        r.pull();
      });
    }
    setRep(r);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rep, userId]);
  return <></>;
}
