import { ReactNode } from "react";
import SettingRep from "./SetQuestsRep";

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
