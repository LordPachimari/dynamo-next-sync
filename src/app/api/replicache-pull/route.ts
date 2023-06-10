import { headers } from "next/dist/client/components/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs";
import { space } from "postcss/lib/list";
import { z } from "zod";
import {
  getChangedItems,
  getLastMutationId,
  getSpaceVersion,
} from "~/repl/data";
import { Quest, Solution } from "~/types/types";
import { userId } from "~/utils/constants";

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
  // const { userId } = auth();
  // if (!userId) {
  //   return new Response("Unauthorized", { status: 401 });
  // }
  const json = (await req.json()) as PullRequestSchemaType;

  console.log("Processing mutation pull:", JSON.stringify(json, null, ""));
  const { searchParams } = new URL(req.url);
  const spaceId = z.string().parse(searchParams.get("spaceId"));
  console.log("hello?", json);
  json.cookie = JSON.parse(json.cookie as string) as { version: number };
  const pull = pullRequestSchema.parse(json);
  console.log("spaceId", spaceId);
  console.log("clientId", pull.clientID);

  const startTransact = Date.now();
  const processPull = async () => {
    const version = await getSpaceVersion({ spaceId, userId });
    const fromVersion =
      pull.cookie && pull.cookie.version ? pull.cookie.version : 0;

    console.log("cooookie version", fromVersion);

    const lastMutationIDPromise = getLastMutationId({
      clientId: pull.clientID,
    });
    const items = getChangedItems({
      prevVersion: fromVersion,
      spaceId,
      userId,
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
  const patch = [];
  const resp = {
    lastMutationID: lastMutationID ?? 0,
    cookie: JSON.stringify(responseCookie) ?? 0,
    patch: items.map((item) => {
      const QuestOrSolution = item as Quest | Solution;
      if (QuestOrSolution.inTrash) {
        return {
          op: "del",
          key: QuestOrSolution.id,
        };
      } else {
        return {
          op: "put",
          key: QuestOrSolution.id,
          value: QuestOrSolution,
        };
      }
    }),
  };
  console.log("patch", resp);
  console.log("Building patch took", Date.now() - startBuildingPatch);

  console.log("----------------------------------------------------");

  return NextResponse.json(resp);
}
