import { useAuth } from "@clerk/nextjs";
import { ReactNode, useEffect, useState } from "react";
import { Replicache } from "replicache";
import { env } from "~/env.mjs";
import { mutators } from "~/repl/mutators";
import { PUBLISHED_QUESTS } from "~/utils/constants";
import { ReplicacheInstancesStore } from "~/zustand/rep";
import Pusher from "pusher-js";
import SettingRep from "./SettingRep";

// const Editor = dynamic(
//   () => import("../../../../components/Workspace/Editor"),
//   {
//     loading: () => <p>Loading...</p>,
//     ssr: false,
//   }
// );

export default function QuestsLayout({
  children, // will be a page or nested layout
}: {
  children: ReactNode;
}) {
  return (
    <main>
      <SettingRep />
      {children}
    </main>
  );
}
