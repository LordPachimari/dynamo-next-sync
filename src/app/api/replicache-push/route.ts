import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs";
import { z } from "zod";
import { jsonSchema } from "~/utils/json";
import { QuestZod } from "~/types/types";
import { getLastMutationId, getSpaceVersion, setLastMutationId, setSpaceVersion } from "~/repl/data";
import { QUEST_PREFIX, userId } from "~/utils/constants";
import { ReplicacheTransaction } from "~/repl/transaction";

// See notes in bug: https://github.com/rocicorp/replidraw/issues/47
const mutationSchema = z.object({
  id: z.number(),
  name: z.string(),
  args: jsonSchema,
});
const idSchema = z.object({
  id: z.string(),
});
const createQuestArgsSchema = z.object({ quest: QuestZod });

type Mutation = z.infer<typeof mutationSchema>;

const pushRequestSchema = z.object({
  clientID: z.string(),
  mutations: z.array(mutationSchema),
});

export async function POST(req: Request, res: Response) {
  console.log("----------------------------------------------------");
  // const { userId } = auth();
  // if (!userId) {
  //   return new Response("Unauthorized", { status: 401 });
  // }
  console.log("Processing push");

  const { searchParams } = new URL(req.url);

  const spaceId = z.string().parse(searchParams.get("spaceId"));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await req.json();

  console.log("json", json);
  const push = pushRequestSchema.parse(json);
  if (push.mutations.length === 0) {
    console.log("no mutations");
    return NextResponse.json({});
  }
  const t0 = Date.now();

  const processMutations = async () => {
    const prevVersion = await getSpaceVersion({
      spaceId,

      userId,
    });

    const nextVersion = prevVersion + 1;
    let lastMutationId =
      (await getLastMutationId({ clientId: push.clientID })) ?? 0;

    console.log("prevVersion: ", prevVersion);
    console.log("lastMutationID:", lastMutationId);

    const tx = new ReplicacheTransaction(
      spaceId,
      push.clientID,
      nextVersion,
      userId
    );

    for (let i = 0; i < push.mutations.length; i++) {
      const mutation = push.mutations[i] as Mutation;
      try {
        const nextMutationId = processMutation({
          tx,
          lastMutationId,
          mutation,
        });
        lastMutationId = nextMutationId || lastMutationId;
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
        });
        lastMutationId = nextMutationId || lastMutationId;
      }
    }

    return await Promise.all([
      setLastMutationId({
        clientId: push.clientID,
        lastMutationId,
      }),
      setSpaceVersion({ spaceId, version: nextVersion, userId }),
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
}: {
  tx: ReplicacheTransaction;
  mutation: Mutation;
  lastMutationId: number;
  error?: any;
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

        tx.put({ key: `${QUEST_PREFIX}${quest.id}`, value: quest });

        break;
      case "deleteQuest":
        const params = idSchema.parse(mutation.args);
        tx.del({ key: `${QUEST_PREFIX}${params.id}` });
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
