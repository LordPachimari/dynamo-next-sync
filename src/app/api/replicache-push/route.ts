import { NextResponse } from "next/server";

import { z } from "zod";
import { jsonSchema } from "~/utils/json";
import { QuestZod } from "~/types/types";

import { QUEST_PREFIX, WORKSPACE_LIST } from "~/utils/constants";
import { ReplicacheTransaction } from "~/repl/transaction";
import {
  getLastMutationIds,
  getLastMutationIdsSince,
  getSpaceVersion,
  setLastMutationId,
  setLastMutationIds,
  setSpaceVersion,
} from "~/repl/data";
import { auth } from "@clerk/nextjs";

// See notes in bug: https://github.com/rocicorp/replidraw/issues/47
const mutationSchema = z.object({
  id: z.number(),
  name: z.string(),
  args: jsonSchema,
  clientID: z.string(),
});
const idSchema = z.object({
  id: z.string(),
});
const createQuestArgsSchema = z.object({ quest: QuestZod });

type Mutation = z.infer<typeof mutationSchema>;

const pushRequestSchema = z.object({
  pushVersion: z.literal(1),
  profileID: z.string(),
  clientGroupID: z.string(),
  mutations: z.array(mutationSchema),
});

export async function POST(req: Request, res: Response) {
  console.log("----------------------------------------------------");
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  console.log("Processing push");

  const { searchParams } = new URL(req.url);

  const spaceId = z.string().parse(searchParams.get("spaceId"));

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await req.json();
  const adjustedSpaceId =
    //if the space is workspace list or
    //if the space is a work - quest/solution/post in workspace make it private by adding userId.
    spaceId === WORKSPACE_LIST ? `${spaceId}#${userId}` : spaceId;

  console.log("json", json);
  const push = pushRequestSchema.parse(json);
  if (push.mutations.length === 0) {
    console.log("no mutations");
    return NextResponse.json({});
  }
  const t0 = Date.now();

  const processMutations = async () => {
    const prevVersion = await getSpaceVersion({
      spaceId: adjustedSpaceId,

      userId,
    });

    const nextVersion = prevVersion + 1;
    const clientIDs = [...new Set(push.mutations.map((m) => m.clientID))];
    const lastMutationIds = await getLastMutationIds({
      clientGroupID: push.clientGroupID,
      clientIDs,
    });

    console.log("prevVersion: ", prevVersion);
    console.log("lastMutationIDs:", lastMutationIds);

    const tx = new ReplicacheTransaction(adjustedSpaceId, nextVersion, userId);

    for (let i = 0; i < push.mutations.length; i++) {
      const mutation = push.mutations[i] as Mutation;

      tx.setClientID({ clientID: mutation.clientID });
      const lastMutationId = lastMutationIds[mutation.clientID] || 0;
      try {
        const nextMutationId = processMutation({
          tx,
          lastMutationId,
          mutation,
          userId,
        });
        lastMutationIds[mutation.clientID] = nextMutationId
          ? nextMutationId
          : lastMutationId;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "UNAUTHORIZED") {
            throw new Error("UNAUTHORISED");
          }
        }
        const nextMutationId = processMutation({
          tx,
          lastMutationId,
          mutation,
          error,
          userId,
        });

        lastMutationIds[mutation.clientID] = nextMutationId
          ? nextMutationId
          : lastMutationId;
      }
    }

    return await Promise.all([
      setLastMutationIds({
        clientGroupId: push.clientGroupID,
        lmids: lastMutationIds,
        version: nextVersion,
      }),

      //each workspace list is a private list. So each user can view only its own workspace list.
      setSpaceVersion({
        spaceId: adjustedSpaceId,
        version: nextVersion,
        userId,
      }),
      tx.flush(),
    ]);
  };
  try {
    await processMutations();
  } catch (error) {
    console.log(error);
    throw new Error("push error");
  }

  console.log("Processed all mutations in", Date.now() - t0);

  // if (
  //   process.env.NEXT_PUBLIC_PUSHER_APP_ID &&
  //   process.env.NEXT_PUBLIC_PUSHER_KEY &&
  //   process.env.NEXT_PUBLIC_PUSHER_SECRET &&
  //   process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  // ) {
  //   const startPoke = Date.now();

  //   const pusher = new Pusher({
  //     appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
  //     key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  //     secret: process.env.NEXT_PUBLIC_PUSHER_SECRET,
  //     cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  //     useTLS: true,
  //   });

  //   await pusher.trigger("default", "poke", {});
  //   console.log("Poke took", Date.now() - startPoke);
  // } else {
  //   console.log("Not poking because Pusher is not configured");
  // }
  return NextResponse.json({});
}

const processMutation = ({
  tx,
  mutation,
  error,
  lastMutationId,
  userId,
}: {
  tx: ReplicacheTransaction;
  mutation: Mutation;
  lastMutationId: number;
  error?: any;
  userId: string;
}) => {
  const expectedMutationID = lastMutationId + 1;
  if (mutation.id < expectedMutationID) {
    console.log(
      `Mutation ${mutation.id} has already been processed - skipping`
    );
    return;
  }
  if (mutation.id > expectedMutationID) {
    console.warn(`Mutation ${mutation.id} is from the future - aborting`);

    throw new Error(`Mutation ${mutation.id} is from the future - aborting`);
  }

  if (!error) {
    console.log("Processing mutation:", JSON.stringify(mutation, null, ""));

    const t1 = Date.now();
    // For each possible mutation, run the server-side logic to apply the
    // mutation.
    switch (mutation.name) {
      case "createQuest":
        const { quest } = createQuestArgsSchema.parse(mutation.args);

        tx.put({ key: `EDITOR#${quest.id}`, value: quest });

        break;
      case "deleteQuest":
        const params = idSchema.parse(mutation.args);
        tx.del({ key: `EDITOR#${params.id}` });
      default:
        throw new Error(`Unknown mutation: ${mutation.name}`);
    }

    console.log("Processed mutation in", Date.now() - t1);

    console.log("----------------------------------------------------");

    return expectedMutationID;
  } else {
    // TODO: You can store state here in the database to return to clients to
    // provide additional info about errors.
    console.log(
      "Handling error from mutation",
      JSON.stringify(mutation),
      error
    );
  }
};
