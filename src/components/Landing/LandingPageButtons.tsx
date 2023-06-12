"use client";

import { useRouter } from "next/navigation";

import { Button } from "../../ui/Button";

export default function LandingPageButtons() {
  const router = useRouter();
  return (
    <>
      <Button
        className="bg-blue-500 font-bold hover:bg-blue-600"
        onClick={() => void router.push("/home")}
      >
        View quests
      </Button>{" "}
      <Button
        className="bg-blue-500 font-bold hover:bg-blue-600"
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
