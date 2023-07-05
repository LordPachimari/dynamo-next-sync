import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { Button } from "./Button";
import { Switch } from "./Switch";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Badge } from "./Badge";
import { cn } from "~/utils/cn";
import { Menu } from "lucide-react";
import { ScrollArea } from "./ScrollArea";
import { user } from "~/utils/constants";

export default function Sidebar({
  showSidebar,
  toggleShowSidebar,
}: {
  showSidebar: boolean;
  toggleShowSidebar: () => void;
}) {
  const router = useRouter();

  const segment = useSelectedLayoutSegment();
  console.log("segment", segment);
  const { userId, isSignedIn, isLoaded } = useAuth();

  const { signOut } = useClerk();

  const links = [
    { page: "workspace", finished: true, public: false },
    { page: "quests", finished: true, public: true },

    { page: "talent", finished: false, public: true },
    { page: "leaderboard", finished: false, public: true },
    { page: "chat", finished: false, public: false },
    { page: "guild", finished: false, public: false },

    { page: "forum", finished: false, public: true },

    { page: "settings", finished: false, public: false },
  ] as const;
  return (
    <div className={`sidebar ${showSidebar ? "show" : ""}`}>
      <div className="flex items-center justify-between pb-2">
        <Switch className="bg-blue-500 " />
        <Button
          className="bg-blue-100 hover:bg-blue-200"
          onClick={() => toggleShowSidebar()}
        >
          <Menu className="text-blue-500" />
        </Button>
      </div>
      {isSignedIn && (
        <Link href={`/profile/${user.username}`}>
          <div className="flex h-64 w-full items-center justify-center rounded-md border-[1px] bg-blue-50 shadow-inner"></div>
          <div className="flex flex-col items-center p-2">
            <Badge className="bg-blue-500">{user.level} lvl</Badge>
            <p className="font-bold">{user.username}</p>
          </div>
        </Link>
      )}
      {!isSignedIn && (
        <div className="flex h-64 w-full items-center justify-center rounded-md border-[1px] bg-blue-50 shadow-inner">
          <Button className="bg-blue-500 hover:bg-blue-600">Sign in</Button>
        </div>
      )}

      <ScrollArea className="h-fit w-full">
        {links.map((l, i) => {
          // if (isSignedIn && user) { //   return (
          //     <Link href={`/${l}`} key={i}>
          //       <Box>
          //          <Text fontSize={{ base: "md" }}>{l.toUpperCase()}</Text>
          //       </Box>
          //     </Link>
          //   );
          // }
          if ((isSignedIn && l.finished) || (l.public && l.finished)) {
            return (
              <Link href={`/${l.page}`} key={l.page}>
                <span
                  className={cn(
                    "my-1 flex h-9 items-center rounded-md p-2  hover:bg-blue-100 hover:text-blue-500 ",
                    {
                      "bg-blue-100 text-blue-500": segment === l.page,
                    }
                  )}
                >
                  <p className="font-bold">{l.page.toUpperCase()}</p>
                </span>
              </Link>
            );
          }
          if (isSignedIn && !l.finished) {
            return (
              <span
                key={l.page}
                className={cn(
                  "my-1 flex h-9 cursor-pointer items-center rounded-md p-2  hover:bg-blue-100 hover:text-blue-500 ",
                  {
                    "bg-blue-100 text-blue-500": segment === l.page,
                  }
                )}
              >
                <p className="font-bold">{l.page.toUpperCase()}</p>
              </span>
            );
          }
          return (
            <span
              key={l.page}
              className={cn(
                "my-1 flex h-9 cursor-pointer items-center rounded-md p-2 hover:bg-blue-100 hover:text-blue-500 ",
                {
                  "bg-blue-100 text-blue-500": segment === l.page,
                }
              )}
            >
              <p className="font-bold">{l.page.toUpperCase()}</p>
            </span>
          );
        })}
      </ScrollArea>
      {isSignedIn ? (
        <div className="mb-2 mt-5 flex justify-center">
          {" "}
          <Button className="bg-blue-500 hover:bg-blue-600">
            <p>Sign out</p>
          </Button>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button className=" bg-blue-500 hover:bg-blue-600">
            <p>Sign in</p>
          </Button>
        </div>
      )}
    </div>
  );
}
