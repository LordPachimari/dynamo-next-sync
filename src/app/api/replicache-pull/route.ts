import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import {
  getLastMutationIdsSince,
  getPatch,
  getPrevCVR,
  setCVR,
} from "~/repl/data";

import { auth, currentUser } from "@clerk/nextjs";
import type { ClientID, PatchOperation } from "replicache";
import {
  LEADERBOARD,
  PUBLISHED_QUESTS,
  STRANGER,
  USER,
  WORKSPACE,
} from "~/utils/constants";

export type PullResponse = {
  cookie: string;
  lastMutationIDChanges: Record<ClientID, number>;
  patch: PatchOperation[];
};
const cookieSchema = z.object({
  PUBLISHED_QUESTS_CVR: z.optional(z.string()),
  WORKSPACE_CVR: z.optional(z.string()),
  USER_CVR: z.optional(z.string()),
  LEADERBOARD_CVR: z.optional(z.string()),

  lastMutationIdsCVRKey: z.optional(z.string()),
});
type cookieSchemaType = z.infer<typeof cookieSchema>;
const pullRequestSchema = z.object({
  pullVersion: z.literal(1),
  profileID: z.string(),
  clientGroupID: z.string(),
  cookie: z.union([z.string(), z.null()]),
  schemaVersion: z.string(),
});
type PullRequestSchemaType = {
  clientGroupID: string;

  cookie: string | null;
};
export async function POST(req: NextRequest, res: NextResponse) {
  console.log("----------------------------------------------------");

  const { searchParams } = new URL(req.url);
  const spaceId = z.string().parse(searchParams.get("spaceId"));
  const userId: string = auth().userId ? (auth().userId as string) : STRANGER;

  // if (!userId) {
  //   if (spaceId !== PUBLISHED_QUESTS && spaceId !== LEADERBOARD) {
  //     return {
  //       cookie: "",
  //       lastMutationIDChanges: {},
  //       patch: [],
  //     } satisfies PullResponse;
  //   }
  // }
  const json = (await req.json()) as PullRequestSchemaType;

  console.log("Processing mutation pull:", JSON.stringify(json, null, ""));
  const adjustedSpaceId =
    //if the space is workspace list  -- make it private by adding userId.
    userId && (spaceId === WORKSPACE || spaceId === USER)
      ? `${spaceId}#${userId}`
      : spaceId;
  const pull = pullRequestSchema.parse(json);
  const requestCookie = pull.cookie
    ? cookieSchema.parse(JSON.parse(pull.cookie))
    : undefined;
  const startTransact = Date.now();
  const processPull = async () => {
    const [prevCVR, prevLastMutationIdsCVR] = await Promise.all([
      getPrevCVR({
        key:
          requestCookie && spaceId === WORKSPACE
            ? requestCookie.WORKSPACE_CVR
            : requestCookie && spaceId === PUBLISHED_QUESTS
            ? requestCookie.PUBLISHED_QUESTS_CVR
            : requestCookie && spaceId === USER
            ? requestCookie.USER_CVR
            : requestCookie && spaceId === LEADERBOARD
            ? requestCookie.LEADERBOARD_CVR
            : undefined,
      }),
      getPrevCVR({
        key: requestCookie ? requestCookie.lastMutationIdsCVRKey : undefined,
      }),
    ]);
    console.log("Getting CVR time", Date.now() - startTransact);

    const patchPromise = getPatch({
      prevCVR,
      spaceId: adjustedSpaceId,
      userId,
    });

    const lastMutationIDsPromise = getLastMutationIdsSince({
      clientGroupId: pull.clientGroupID,
      prevLastMutationIdsCVR,
    });

    return Promise.all([patchPromise, lastMutationIDsPromise]);
  };

  const [
    { cvr: nextCVR, patch },
    { lastMutationIDChanges, nextLastMutationIdsCVR },
  ] = await processPull();

  console.log("transact took", Date.now() - startTransact);

  console.log("lastMutationIDsChanges: ", lastMutationIDChanges);

  const resp: PullResponse = {
    lastMutationIDChanges,
    cookie: JSON.stringify({
      ...requestCookie,

      ...(spaceId === USER && { USER_CVR: nextCVR.id }),
      ...(spaceId === WORKSPACE && { WORKSPACE_CVR: nextCVR.id }),
      ...(spaceId === PUBLISHED_QUESTS && { PUBLISHED_QUESTS_CVR: nextCVR.id }),
      ...(spaceId === LEADERBOARD && { LEADERBOARD_CVR: nextCVR.id }),
      ...(nextLastMutationIdsCVR && {
        lastMutationIdsCVRKey: nextLastMutationIdsCVR.id,
      }),
    } satisfies cookieSchemaType),
    patch,
  };
  console.log("patch", resp);
  try {
    if (nextLastMutationIdsCVR) {
      await Promise.allSettled([
        setCVR({ CVR: nextCVR, key: nextCVR.id }),
        setCVR({
          CVR: nextLastMutationIdsCVR,
          key: nextLastMutationIdsCVR.id,
        }),
      ]);
    } else {
      await setCVR({ CVR: nextCVR, key: nextCVR.id });
    }
  } catch (error) {
    console.log(error);
  }
  console.log("total time", Date.now() - startTransact);

  console.log("----------------------------------------------------");

  return NextResponse.json(resp);
}
