"use client";

import { Menu } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import GlobalSearch from "~/components/GlobalSearch";
import { Button } from "~/ui/Button";
import Sidebar from "~/ui/Sidebar";

export default function SidebarLayout({
  children, // will be a page or nested layout
}: {
  children: ReactNode;
}) {
  const [showSidebar, toggle] = useState(false);

  const toggleShowSidebar = () => {
    toggle((val) => !val);
    localStorage.setItem("sidebar", JSON.stringify(!showSidebar));
  };
  useEffect(() => {
    const showSidebar = JSON.parse(
      localStorage.getItem("sidebar") as string
    ) as boolean;
    if (showSidebar) {
      toggle(showSidebar);
    }
  }, []);
  return (
    <div className="flex">
      <Sidebar
        showSidebar={showSidebar}
        toggleShowSidebar={toggleShowSidebar}
      />
      <div
        className={`childrenContainer ${showSidebar ? "adjustChildren" : ""}`}
        onClick={() => {
          if (window.innerWidth <= 1024) {
            if (showSidebar) {
              toggleShowSidebar();
            }
          }
        }}
      >
        {!showSidebar ? (
          <Button
            className="fixed z-50 m-2 bg-blue-4 hover:bg-blue-5"
            size="icon"
            onClick={() => toggleShowSidebar()}
          >
            <Menu className="text-blue-9" />
          </Button>
        ) : null}
        <div className="fixed z-40 flex h-14 w-full items-center justify-center border-b-[1px] bg-white backdrop-blur-sm dark:border-slate-8 dark:bg-slate-3">
          <GlobalSearch />
        </div>
        {children}
      </div>
    </div>
  );
}
