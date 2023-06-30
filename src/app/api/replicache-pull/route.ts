import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import {
  getLastMutationIdsCVR,
  getLastMutationIdsSince,
  getPatch,
  getPrevCVR,
  setCVR,
  setLastMutationIdsCVR,
} from "~/repl/data";

import { auth } from "@clerk/nextjs";
import { ClientID, PatchOperation } from "replicache";
import { WORKSPACE } from "~/utils/constants";

export type PullResponse = {
  cookie: string;
  lastMutationIDChanges: Record<ClientID, number>;
  patch: PatchOperation[];
};
const cookieSchema = z.object({
  keyCVR: z.string(),
  keyLastMutationIdsCVR: z.optional(z.string()),
});
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
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const json = (await req.json()) as PullRequestSchemaType;

  console.log("Processing mutation pull:", JSON.stringify(json, null, ""));
  const { searchParams } = new URL(req.url);
  const spaceId = z.string().parse(searchParams.get("spaceId"));
  const adjustedSpaceId =
    //if the space is workspace list  -- make it private by adding userId.
    spaceId === WORKSPACE ? `${spaceId}#${userId}` : spaceId;
  console.log("spaceId", adjustedSpaceId);
  const pull = pullRequestSchema.parse(json);
  const requestCookie = pull.cookie
    ? cookieSchema.parse(JSON.parse(pull.cookie))
    : undefined;

  console.log("cooookie ", requestCookie);

  const startTransact = Date.now();
  const processPull = async () => {
    // let items: any[] = [];

    const [prevCVR, prevLastMutationIdsCVR] = await Promise.all([
      getPrevCVR({
        key: requestCookie ? requestCookie.keyCVR : undefined,
        spaceId: adjustedSpaceId,
      }),
      getLastMutationIdsCVR({
        spaceId: adjustedSpaceId,
        key: requestCookie ? requestCookie.keyLastMutationIdsCVR : undefined,
      }),
    ]);

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
      keyCVR: nextCVR.id,
      keyLastMutationIdsCVR: nextLastMutationIdsCVR
        ? nextLastMutationIdsCVR.id
        : null,
    }),
    patch,
  };
  console.log("patch", resp);
  try {
    if (nextLastMutationIdsCVR) {
      await Promise.allSettled([
        setCVR({ CVR: nextCVR, key: nextCVR.id, spaceId: adjustedSpaceId }),
        setLastMutationIdsCVR({
          spaceId: adjustedSpaceId,
          CVR: nextLastMutationIdsCVR,
          key: nextLastMutationIdsCVR.id,
        }),
      ]);
    } else {
      await setCVR({ CVR: nextCVR, key: nextCVR.id, spaceId: adjustedSpaceId });
    }
  } catch (error) {
    console.log(error);
  }
  console.log("total time", Date.now() - startTransact);

  console.log("----------------------------------------------------");

  return NextResponse.json(resp);
}
