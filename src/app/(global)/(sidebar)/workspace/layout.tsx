import { type ReactNode } from "react";
import ListComponent from "../../../../components/Workspace/ListComponent";

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
