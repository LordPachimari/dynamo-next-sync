import { ReactNode } from "react";

export default function MySheet({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="fixed inset-0 z-50 overflow-y-auto bg-background/80 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in"
    >
      <div className="fixed inset-y-0 right-0 z-50 h-full w-full gap-4 overflow-y-auto border-l bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right  data-[state=open]:slide-in-from-right data-[state=closed]:duration-300 data-[state=open]:duration-500 lg:w-[900px]">
        {children}
      </div>
    </div>
  );
}
