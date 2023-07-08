"use client";
import { useAuth } from "@clerk/nextjs";
import { useSubscribe } from "replicache-react";
import AboutUser from "~/components/Profile/About";
import Achievements from "~/components/Profile/Achiements";
import UserPosts from "~/components/Profile/Posts";
import UserTopics from "~/components/Profile/Topics";
import { userKey } from "~/repl/client/mutators/user";
import { User } from "~/types/types";
import { Button } from "~/ui/Button";
import { Card, CardContent, CardHeader } from "~/ui/Card";
import { user } from "~/utils/constants";
import { ReplicacheInstancesStore } from "~/zustand/rep";
const newDate = new Date().toISOString();
export default function Profile({
  isMyProfile,
  user,
  userId,
}: {
  isMyProfile: boolean;
  user: User;
  userId: string | null;
}) {
  // const { userId } = useAuth();
  const rep = ReplicacheInstancesStore((state) => state.globalRep);
  let currentUser: User | null = user;
  const localUser = useSubscribe(
    rep,
    async (tx) => {
      if (userId) {
        const user = (await tx.get(userKey(userId))) || null;
        console.log("user", user);

        return user;
      }
      return null;
    },

    null,
    [user]
  ) as User | null;
  if (isMyProfile) {
    currentUser = localUser;
  }
  if (!currentUser) {
    return <></>;
  }

  return (
    <div className="mb-20 flex w-full justify-center">
      <div className="mt-16 w-11/12 max-w-7xl justify-center gap-4 md:flex">
        {/* {isSignedIn && user.data && userId === user.data.id && (
              <Character
                id={user.data.id}
                isCharacterOpen={isCharacterOpen}
                onCharacterClose={onCharacterClose}
                onCharacterOpen={onCharacterOpen}
                profile={user.data.profile}
                username={user.data.username}
              />
            )}
     */}
        <div className="mb-4 flex w-full flex-col items-center gap-4 md:w-[300px] ">
          <Card className="flex w-full flex-col items-center justify-center rounded-xl py-4 drop-shadow-sm ">
            <CardHeader className="w-full px-4 py-0">
              <div className="flex h-[300px] w-full items-center justify-center rounded-md border-[1px] bg-blue-50 shadow-inner">
                <Button className="  bg-blue-100 font-extrabold text-blue-700 hover:bg-blue-200">
                  Create character
                </Button>
              </div>
            </CardHeader>
            <CardContent className="w-full p-4">
              <div className="mt-2 flex items-center justify-center gap-2">
                {" "}
                <p className="font-bold text-gray-500">69 followers</p>
                <p className="font-bold text-gray-500">69 following</p>
              </div>
              <div className="flex w-full flex-col">
                {"user1" !== "user1" ? (
                  <>
                    <Button className=" mx-auto mt-5 w-full max-w-xs bg-blue-100 font-extrabold text-blue-700 hover:bg-blue-200 ">
                      Send message
                    </Button>

                    <Button className=" mx-auto mt-5 w-full max-w-xs bg-green-100 font-extrabold text-green-700 hover:bg-green-200 ">
                      Follow
                    </Button>
                  </>
                ) : (
                  <Button className=" mx-auto mt-5 w-full max-w-xs bg-green-100 font-extrabold text-green-700 hover:bg-green-200 ">
                    Edit profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="flex w-full flex-col items-center justify-center rounded-xl  py-2 drop-shadow-md">
            <CardHeader className="w-full justify-center px-4 py-0">
              <h2 className="text-center">GUILD</h2>
              <div className="flex h-[200px] w-full items-center justify-center rounded-md border-[1px] bg-gray-50 ">
                {"user1" === "user1" && (
                  <Button className=" max-w-xs bg-blue-100 font-extrabold text-blue-700 hover:bg-blue-200 ">
                    Search for a guild
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-2"></CardContent>
          </Card>
        </div>
        <div className="w-full max-w-3xl">
          <AboutUser
            isEditable={currentUser.id === "user1"}
            username={currentUser.username}
            about={currentUser.about}
            level={currentUser.level}
            experience={currentUser.experience}
            links={currentUser.links}
          />
          <UserTopics />
          <Achievements />

          <UserPosts />
        </div>
      </div>
    </div>
  );
}
