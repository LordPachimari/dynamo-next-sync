import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { Button } from "./Button";
import { Switch } from "./Switch";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Badge } from "./Badge";
import { cn } from "~/utils/cn";
import { Menu } from "lucide-react";
import { ScrollArea } from "./ScrollArea";
import { ThemeToggle } from "~/components/theme-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./AlertDialog";
import { useState } from "react";
import { toast } from "sonner";
import { ReplicacheInstancesStore } from "~/zustand/rep";
import { useSubscribe } from "replicache-react";
import { userKey } from "~/repl/client/mutators/user";
import { User } from "~/types/types";

export default function Sidebar({
  showSidebar,
  toggleShowSidebar,
}: {
  showSidebar: boolean;
  toggleShowSidebar: () => void;
}) {
  const router = useRouter();
  const rep = ReplicacheInstancesStore((state) => state.globalRep);

  const segment = useSelectedLayoutSegment();
  const { userId, isSignedIn, isLoaded, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const user = useSubscribe(
    rep,
    async (tx) => {
      if (userId) {
        const user = (await tx.get(userKey(userId))) || null;

        return user;
      }
      return null;
    },

    null,
    []
  ) as User | null;

  const links = [
    { page: "workspace", href: "/workspace", finished: true, public: false },
    { page: "quests", href: "/quests", finished: true, public: true },

    { page: "talent", href: "/talent", finished: false, public: true },
    {
      page: "leaderboard",
      href: "/leaderboard",
      finished: true,
      public: true,
    },
    { page: "chat", href: "/chat", finished: false, public: false },
    { page: "guild", href: "guild", finished: false, public: false },

    { page: "forum", href: "/forum", finished: false, public: true },

    {
      page: "settings",
      href: "/settings/profile",
      finished: true,
      public: false,
    },
  ] as const;
  return (
    <div className={`sidebar ${showSidebar ? "show" : ""}`}>
      <div className="flex items-center justify-between pb-2">
        <ThemeToggle />
        <Button
          className="bg-blue-4 hover:bg-blue-5"
          size="icon"
          onClick={() => toggleShowSidebar()}
        >
          <Menu className="text-blue-9" />
        </Button>
      </div>
      {isSignedIn && user && (
        <Link href={`/profile/${user.username}`}>
          <div className="flex h-64 w-full items-center justify-center rounded-md border-[1px] bg-blue-2 shadow-inner dark:border-none dark:shadow-blue-6"></div>
          <div className="flex flex-col items-center p-2">
            <Badge className="bg-red-500">{user.level} lvl</Badge>
            <p className="font-bold">{user.username}</p>
          </div>
        </Link>
      )}
      {!isSignedIn && (
        <div className="flex h-64 w-full items-center justify-center rounded-md border-[1px] bg-blue-2 shadow-inner dark:border-none dark:shadow-blue-6">
          <Button
            className="bg-blue-9 hover:bg-blue-10"
            onClick={() => router.push("/")}
          >
            Sign in
          </Button>
        </div>
      )}

      <ScrollArea className="h-80 w-full">
        {links.map((l, i) => {
          // if (isSignedIn && user) { //   return (
          //     <Link href={`/${l}`} key={i}>
          //       <Box>
          //          <Text fontSize={{ base: "md" }}>{l.toUpperCase()}</Text>
          //       </Box>
          //     </Link>
          //   );
          // }
          if (l.finished) {
            return (
              <Link href={l.href} key={l.page}>
                <span
                  className={cn(
                    "my-1 flex h-9 items-center rounded-md p-2  hover:bg-blue-4 hover:text-blue-9 ",
                    {
                      "bg-blue-4 text-blue-9": segment === l.page,
                    }
                  )}
                >
                  <p className="font-bold">{l.page.toUpperCase()}</p>
                </span>
              </Link>
            );
          }
          return (
            <span
              key={l.page}
              onClick={() => toast("the page is still in development")}
              className={cn(
                "my-1 flex h-9 cursor-pointer items-center rounded-md p-2  hover:bg-blue-4 hover:text-blue-9 ",
                {
                  "bg-blue-4 text-blue-9": segment === l.page,
                }
              )}
            >
              <p className="font-bold">{l.page.toUpperCase()}</p>
            </span>
          );
        })}
      </ScrollArea>
      {isSignedIn && (
        <div className="mb-2 mt-5 flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-red-9 hover:bg-red-10 dark:text-white">
                <p>Sign out</p>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-slate-6">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm your action</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure? Please dont. Just kidding, do whatever you want.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    className="bg-red-9 hover:bg-red-10 dark:text-white"
                    onClick={() => {
                      setIsSigningOut(true);

                      signOut()
                        .catch((err) => console.log("error logging out", err))
                        .finally(() => setIsSigningOut(false));
                    }}
                  >
                    <p>Sign out</p>
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
