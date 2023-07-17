"use client";

import { useRouter } from "next/navigation";

import { Button } from "../../ui/Button";

export default function LandingPageButtons() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-2">
      {window.innerWidth < 1024 && (
        <Button
          className="rounded-md bg-blue-9 px-8 py-4 text-center text-lg font-medium text-white hover:bg-blue-10"
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
      )}
    </div>
  );
}
