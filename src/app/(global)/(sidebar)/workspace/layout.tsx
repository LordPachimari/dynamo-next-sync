import { useEffect, useState, type ReactNode } from "react";
import ListComponent from "./ListComponent";

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
  return (
    <div className="relative flex">
      <ListComponent>{children}</ListComponent>
    </div>
  );
}
