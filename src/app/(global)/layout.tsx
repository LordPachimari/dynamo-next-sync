import { type ReactNode } from "react";

export default function GlobalLayout({
  children, // will be a page or nested layout
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-full w-full justify-center bg-amber-50">
      <div className="w-full max-w-[1984px]">{children}</div>
    </div>
  );
}
