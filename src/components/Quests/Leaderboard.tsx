import Link from "next/link";
import { useState } from "react";
import { LeaderboardType } from "~/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/Avatar";
import { Badge } from "~/ui/Badge";
import { Button } from "~/ui/Button";
import { Card, CardFooter, CardHeader } from "~/ui/Card";

const UserComponent = ({
  username,
  level,
  profile,
  questsSolved,
  rewarded,
  position,
  filter,
}: LeaderboardType) => {
  return (
    <div className="m-2 flex h-14 flex-row items-center gap-2 rounded-md border-[1px] border-blue-200 p-2">
      <div className="flex h-12 w-4 items-center justify-center text-blue-500">
        <p className="font-bold">{position}</p>
      </div>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
        <Badge className="bg-blue-9">{`${level} lvl`}</Badge>
        <p className="overflow-hidden text-ellipsis whitespace-nowrap font-bold">
          {username}
        </p>
      </div>
      {filter === "quests" && (
        <div className="mr-1 flex w-10 items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path
              d="M19 22H5C3.34315 22 2 20.6569 2 19V3C2 2.44772 2.44772 2 3 2H17C17.5523 2 18 2.44772 18 3V15H22V19C22 20.6569 20.6569 22 19 22ZM18 17V19C18 19.5523 18.4477 20 19 20C19.5523 20 20 19.5523 20 19V17H18ZM16 20V4H4V19C4 19.5523 4.44772 20 5 20H16ZM6 7H14V9H6V7ZM6 11H14V13H6V11ZM6 15H11V17H6V15Z"
              fill="var(--blue)"
            ></path>
          </svg>
          <p className="font-bold text-blue-500">{questsSolved}</p>
        </div>
      )}
      {filter === "reward" && (
        <div className="mr-1 flex w-10 items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
          >
            <path
              d="M4.87759 3.00293H19.1319C19.4518 3.00293 19.7524 3.15601 19.9406 3.41476L23.7634 8.67115C23.9037 8.86403 23.8882 9.12913 23.7265 9.30438L12.3721 21.6049C12.1848 21.8078 11.8685 21.8205 11.6656 21.6332C11.6591 21.6271 7.86486 17.5175 0.282992 9.30438C0.121226 9.12913 0.10575 8.86403 0.246026 8.67115L4.06886 3.41476C4.25704 3.15601 4.55766 3.00293 4.87759 3.00293ZM5.38682 5.00293L2.58738 8.85216L12.0047 19.0543L21.4221 8.85216L18.6226 5.00293H5.38682Z"
              fill="var(--purple)"
            ></path>
          </svg>
          <p className="font-bold text-blue-500">{rewarded}</p>
        </div>
      )}
    </div>
  );
};
export default function Leaderboard() {
  const [filter, setFilter] = useState<"reward" | "quests">("quests");
  return (
    <Card className="h-80 w-11/12 max-w-lg rounded-xl drop-shadow-sm">
      <CardHeader className="flex justify-center p-2 text-center">
        <h2>Leaderboard</h2>
      </CardHeader>
      <div className="flex justify-around">
        <Button>
          {" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path
              d="M19 22H5C3.34315 22 2 20.6569 2 19V3C2 2.44772 2.44772 2 3 2H17C17.5523 2 18 2.44772 18 3V15H22V19C22 20.6569 20.6569 22 19 22ZM18 17V19C18 19.5523 18.4477 20 19 20C19.5523 20 20 19.5523 20 19V17H18ZM16 20V4H4V19C4 19.5523 4.44772 20 5 20H16ZM6 7H14V9H6V7ZM6 11H14V13H6V11ZM6 15H11V17H6V15Z"
              fill="var(--blue)"
            ></path>
          </svg>
        </Button>
        <Button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
          >
            <path
              d="M4.87759 3.00293H19.1319C19.4518 3.00293 19.7524 3.15601 19.9406 3.41476L23.7634 8.67115C23.9037 8.86403 23.8882 9.12913 23.7265 9.30438L12.3721 21.6049C12.1848 21.8078 11.8685 21.8205 11.6656 21.6332C11.6591 21.6271 7.86486 17.5175 0.282992 9.30438C0.121226 9.12913 0.10575 8.86403 0.246026 8.67115L4.06886 3.41476C4.25704 3.15601 4.55766 3.00293 4.87759 3.00293ZM5.38682 5.00293L2.58738 8.85216L12.0047 19.0543L21.4221 8.85216L18.6226 5.00293H5.38682Z"
              fill="var(--purple)"
            ></path>
          </svg>
        </Button>
      </div>

      {/* {leaders.map((u, i) => (
        <Link key={u.id} href={`/profile/${u.username}`}>
          <UserComponent
            username={u.username}
            level={u.level}
            profile={u.profile}
            questsSolved={u.questsSolved}
            position={i + 1}
            filter={filter}
            rewarded={u.rewarded}
          />
        </Link>
      ))} */}
      <CardFooter className="flex justify-center">
        <Link href="/leaderboard">
          <Button className="bg-blue-9 hover:bg-blue-10">
            See full leaderboard
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
