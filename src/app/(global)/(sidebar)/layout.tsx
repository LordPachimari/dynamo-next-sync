"use client";

import { Menu } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
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
    toggle(showSidebar);
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
            className="fixed z-30 m-2 bg-blue-100 hover:bg-blue-200"
            onClick={() => toggleShowSidebar()}
          >
            <Menu className="text-blue-500" />
          </Button>
        ) : null}
        <div className="fixed z-10 z-50 h-14 w-full border-b-[1px]  bg-white dark:border-slate-8 dark:bg-slate-1">
          {/* <GlobalSearch /> */}
        </div>
        {children}
      </div>
    </div>
  );
}
