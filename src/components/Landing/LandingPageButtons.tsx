"use client";

import { useRouter } from "next/navigation";

import { Button } from "../../ui/Button";

export default function LandingPageButtons() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        className="w-40 bg-blue-9 font-bold text-white shadow-lg hover:bg-blue-10"
        onClick={() => void router.push("/quests")}
      >
        View quests
      </Button>{" "}
      <Button
        className="w-40 bg-blue-9 font-bold text-white shadow-lg hover:bg-blue-10"
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
      <div className="p-10">
        <h1>
          If you are not willing to sign up with your email use the following
          credentials.
        </h1>
        <div className="flex flex-col items-center">
          <p>email: thien.vanovich.nguyen@gmail.com</p>
          <p>password: 5*d31#Ta7hHw</p>
        </div>
      </div>
    </div>
  );
}
