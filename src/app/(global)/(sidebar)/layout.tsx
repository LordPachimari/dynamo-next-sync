"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "~/components/Button";
import Sidebar from "~/components/Sidebar";

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
            className="fixed z-30 m-2 bg-orange-100 hover:bg-orange-200"
            onClick={() => toggleShowSidebar()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path
                d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"
                fill="var(--orange)"
              />
            </svg>
          </Button>
        ) : null}
        <div className="border-black-500 fixed z-10 h-14 w-full border bg-white">
          {/* <GlobalSearch /> */}
        </div>
        {children}
      </div>
    </div>
  );
}
