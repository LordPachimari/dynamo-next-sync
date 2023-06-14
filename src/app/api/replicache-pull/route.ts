import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import {
  getChangedItems,
  getLastMutationId,
  getSpaceVersion,
} from "~/repl/general-data";

import { Content, Post, Quest, Solution } from "~/types/types";
import { WORKSPACE_LIST } from "~/utils/constants";

import { auth } from "@clerk/nextjs";
const cookieSchema = z.union([z.object({ version: z.number() }), z.null()]);

type Cookie = z.TypeOf<typeof cookieSchema>;

const pullRequestSchema = z.object({
  clientID: z.string(),
  cookie: cookieSchema,
});
type PullRequestSchemaType = {
  clientID: string;
  cookie: string | { version: number };
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
    //if the space is workspace list or
    //if the space is a work - quest/solution/post in workspace make it private by adding userId.
    spaceId === WORKSPACE_LIST ? `${spaceId}#${userId}` : spaceId;

  console.log("hello?", json);
  json.cookie = JSON.parse(json.cookie as string) as { version: number };
  const pull = pullRequestSchema.parse(json);
  console.log("spaceId", adjustedSpaceId);
  console.log("clientId", pull.clientID);

  const patch = [];
  const startTransact = Date.now();
  const processPull = async () => {
    // let items: any[] = [];
    const version = await getSpaceVersion({ spaceId: adjustedSpaceId, userId });
    const fromVersion =
      pull.cookie && pull.cookie.version ? pull.cookie.version : 0;
    if (fromVersion === 0) {
      patch.push({
        op: "clear",
      });
    }

    console.log("cooookie version", fromVersion);

    const lastMutationIDPromise = getLastMutationId({
      clientId: pull.clientID,
    });
    const items = await getChangedItems({
      prevVersion: fromVersion,
      spaceId: adjustedSpaceId,
    });

    const responseCookie: Cookie = {
      version,
    };
    return Promise.all([items, lastMutationIDPromise, responseCookie]);
  };

  console.log("transact took", Date.now() - startTransact);

  const [items, lastMutationID, responseCookie] = await processPull();
  const startBuildingPatch = Date.now();

  console.log("lastMutationID: ", lastMutationID);
  console.log("responseCookie: ", responseCookie);
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

  const resp = {
    lastMutationID: lastMutationID ?? 0,
    cookie: JSON.stringify(responseCookie) ?? 0,
    patch,
  };
  console.log("patch", resp);
  console.log("Building patch took", Date.now() - startBuildingPatch);

  console.log("----------------------------------------------------");

  return NextResponse.json(resp);
}
