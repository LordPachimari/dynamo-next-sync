"use client";

import { useRouter } from "next/navigation";

import { Button } from "../../ui/Button";

export default function LandingPageButtons() {
  const router = useRouter();
  return (
    <>
      <Button
        className="w-40 bg-blue-400 font-bold text-white shadow-lg hover:bg-blue-500"
        onClick={() => void router.push("/quests")}
      >
        View quests
      </Button>{" "}
      <Button
        className="w-40 bg-blue-400 font-bold text-white shadow-lg hover:bg-blue-500"
        onClick={() => {
          if (window.innerWidth < 1024) {
            window.scrollBy({
              top: window.innerHeight - 50,
              behavior: "smooth",
            });
          }
        }}
      >
        Sign up
      </Button>
    </>
  );
}
