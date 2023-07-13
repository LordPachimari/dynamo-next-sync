import { auth } from "@clerk/nextjs";
import { userByUsername } from "~/server/user";
import Profile from "./Profile";

export default async function Page({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const user = await userByUsername({ username });
  const { userId } = auth();
  if (!user) {
    return <></>;
  }

  const isMyProfile = user.id === userId;

  return <Profile isMyProfile={isMyProfile} user={user} userId={userId} />;
}
