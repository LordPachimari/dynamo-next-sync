"use client";

import { useEffect, useState, type ReactNode } from "react";
import Pusher from "pusher-js";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { Replicache } from "replicache";
import { env } from "~/env.mjs";
import { M, mutators } from "~/repl/mutators";
import { Button } from "~/ui/Button";
import { WORKSPACE } from "~/utils/constants";
import Actions from "./Actions";
import List from "./List";
import { WorkspaceStore } from "~/zustand/workspace";
import dynamic from "next/dynamic";
// const Editor = dynamic(
//   () => import("../../../../components/Workspace/Editor"),
//   {
//     loading: () => <p>Loading...</p>,
//     ssr: false,
//   }
// );

export default function WorkspaceLayout({
  children, // will be a page or nested layout
}: {
  children: ReactNode;
}) {
  const [showList, toggleShowList] = useState(true);
  const rep = WorkspaceStore((state) => state.rep);
  const setRep = WorkspaceStore((state) => state.setRep);

  const { userId } = useAuth();

  useEffect(() => {
    if (rep) {
      return;
    }
    if (userId) {
      const r = new Replicache({
        name: `${WORKSPACE}#${userId}`,
        licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
        pushURL: `/api/replicache-push?spaceId=${WORKSPACE}`,
        pullURL: `/api/replicache-pull?spaceId=${WORKSPACE}`,
        mutators,
        pullInterval: null,
      });
      if (env.NEXT_PUBLIC_PUSHER_KEY && env.NEXT_PUBLIC_PUSHER_CLUSTER) {
        Pusher.logToConsole = true;
        const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
          cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
        });

        const channel = pusher.subscribe(WORKSPACE);
        channel.bind("poke", () => {
          r.pull();
        });
      }

      setRep(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rep, userId]);

  const router = useRouter();
  if (!userId) {
    return router.push("/sign-in");
  }

  return (
    <div className="relative flex">
      <List
        showList={showList}
        toggleShowList={toggleShowList}
        rep={rep}
        userId={userId}
      />
      <div className={`workspaceContainer ${showList ? "adjust" : ""}`}>
        {!showList ? (
          <Button
            className="absolute z-30 m-2 bg-orange-100 hover:bg-orange-200"
            aria-label="open list"
            onClick={() => toggleShowList((val) => !val)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path fill="none" d="M0 0H24V24H0z" />
              <path
                d="M21 18v2H3v-2h18zM17.404 3.904L22 8.5l-4.596 4.596-1.414-1.414L19.172 8.5 15.99 5.318l1.414-1.414zM12 11v2H3v-2h9zm0-7v2H3V4h9z"
                fill="var(--orange)"
              />
            </svg>
          </Button>
        ) : null}

        {children}
      </div>
    </div>
  );
}
