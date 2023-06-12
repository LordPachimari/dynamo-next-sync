"use client";

import { useRouter } from "next/navigation";

import { Button } from "../../ui/Button";

export default function LandingPageButtons() {
  const router = useRouter();
  return (
    <>
      <Button
        className="w-40 bg-orange-400 font-bold text-white shadow-lg hover:bg-orange-500"
        onClick={() => void router.push("/home")}
      >
        View quests
      </Button>{" "}
      <Button
        className="w-40 bg-orange-400 font-bold text-white shadow-lg hover:bg-orange-500"
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
