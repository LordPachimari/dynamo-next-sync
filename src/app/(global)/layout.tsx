import { type ReactNode } from "react";
import SetGlobalRep from "./SetGlobalRep";

export default function GlobalLayout({
  children, // will be a page or nested layout
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-full w-full justify-center bg-slate-10 dark:bg-slate-2">
      <SetGlobalRep />
      <div className="w-full max-w-[1984px]">{children}</div>
    </div>
  );
}
