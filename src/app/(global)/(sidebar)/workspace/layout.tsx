"use client";

import { useState, type ReactNode } from "react";

import List from "./List";
import { Button } from "~/components/Button";
import { userId } from "~/utils/constants";

export default function WorkspaceLayout({
  children, // will be a page or nested layout
}: {
  children: ReactNode;
}) {
  const [showList, toggleShowList] = useState(true);
  return (
    <div className="relative flex">
      <List
        showList={showList}
        toggleShowList={toggleShowList}
        userId={userId}
      />
      <div className={`workspaceContainer ${showList ? "adjust" : ""}`}>
        {!showList ? (
          <Button
            className="absolute z-30 m-2 bg-orange-100 hover:bg-orange-200"
            aria-label="open list"
            onClick={() => toggleShowList((val) => !val)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path fill="none" d="M0 0H24V24H0z" />
              <path
                d="M21 18v2H3v-2h18zM17.404 3.904L22 8.5l-4.596 4.596-1.414-1.414L19.172 8.5 15.99 5.318l1.414-1.414zM12 11v2H3v-2h9zm0-7v2H3V4h9z"
                fill="var(--orange)"
              />
            </svg>
          </Button>
        ) : null}

        {children}
      </div>
    </div>
  );
}
