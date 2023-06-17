import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import {
  getChangedItems,
  getLastMutationIdsSince,
  getSpaceVersion,
} from "~/repl/data";

import { Content, Post, Quest, Solution } from "~/types/types";
import { WORKSPACE_LIST } from "~/utils/constants";

import { auth } from "@clerk/nextjs";
import { ClientID, PatchOperation } from "replicache";

export type PullResponse = {
  cookie: number;
  lastMutationIDChanges: Record<ClientID, number>;
  patch: PatchOperation[];
};

const pullRequestSchema = z.object({
  pullVersion: z.literal(1),
  profileID: z.string(),
  clientGroupID: z.string(),
  cookie: z.union([z.number(), z.null()]),
  schemaVersion: z.string(),
});
type PullRequestSchemaType = {
  clientGroupID: string;

  cookie: number;
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
    //if the space is workspace list or is a work - quest/solution/post -- make it private by adding userId.
    spaceId === WORKSPACE_LIST ? `${spaceId}#${userId}` : spaceId;

  console.log("hello?", json);
  const pull = pullRequestSchema.parse(json);
  console.log("spaceId", adjustedSpaceId);
  console.log("clientGroupId", pull.clientGroupID);

  const patch: PatchOperation[] = [];
  const startTransact = Date.now();
  const processPull = async () => {
    // let items: any[] = [];
    const versionPromise = getSpaceVersion({
      spaceId: adjustedSpaceId,
      userId,
    });
    const fromVersion = pull.cookie ? pull.cookie : 0;
    if (fromVersion === 0) {
      patch.push({
        op: "clear",
      });
    }

    console.log("cooookie version", fromVersion);

    const lastMutationIDsPromise = getLastMutationIdsSince({
      clientGroupId: pull.clientGroupID,
      prevVersion: fromVersion,
    });
    const itemsPromise = getChangedItems({
      prevVersion: fromVersion,
      spaceId: adjustedSpaceId,
    });

    return Promise.all([itemsPromise, lastMutationIDsPromise, versionPromise]);
  };

  console.log("transact took", Date.now() - startTransact);

  const [items, lastMutationIDChanges, version] = await processPull();
  const startBuildingPatch = Date.now();

  console.log("lastMutationIDs: ", lastMutationIDChanges);
  console.log("response version for cookie: ", version);
  console.log("items", items);

  //workspace items

  if (spaceId === WORKSPACE_LIST) {
    for (const item of items) {
      const QuestOrSolutionOrPost = item as (
        | Quest
        | Solution
        | Post
        | Content
      ) & { SK: string };
      if (QuestOrSolutionOrPost.inTrash) {
        patch.push({
          op: "del",
          key: QuestOrSolutionOrPost.SK,
        });
      } else {
        patch.push({
          op: "put",
          key: QuestOrSolutionOrPost.SK,
          value: QuestOrSolutionOrPost,
        });
      }
    }
  }

  const resp: PullResponse = {
    lastMutationIDChanges,
    cookie: version,
    patch,
  };
  console.log("patch", resp);
  console.log("Building patch took", Date.now() - startBuildingPatch);

  console.log("----------------------------------------------------");

  return NextResponse.json(resp);
}
