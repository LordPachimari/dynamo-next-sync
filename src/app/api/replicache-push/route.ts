import { NextResponse } from "next/server";

import { z } from "zod";
import { MutationNamesZod, QuestZod, WorkTypeEnum } from "~/types/types";
import { jsonSchema } from "~/utils/json";

import { auth } from "@clerk/nextjs";
import Pusher from "pusher";
import { env } from "~/env.mjs";
import { getLastMutationIds, setLastMutationIds } from "~/repl/data";
import { WorkspaceMutations } from "~/repl/server/mutations/workspace";
import { ReplicacheTransaction } from "~/repl/transaction";
import { PUBLISHED_QUESTS, WORKSPACE } from "~/utils/constants";

// See notes in bug: https://github.com/rocicorp/replidraw/issues/47
const mutationSchema = z.object({
  id: z.number(),
  name: MutationNamesZod,
  args: jsonSchema,
  clientID: z.string(),
});

export type Mutation = z.infer<typeof mutationSchema>;

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

  const published = {
    quests: false,
    solution: false,
    post: false,
  };
  const { searchParams } = new URL(req.url);

  const spaceId = z.string().parse(searchParams.get("spaceId"));

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await req.json();
  const adjustedSpaceId =
    //if the space is workspace list or
    //if the space is a work - quest/solution/post in workspace make it private by adding userId.
    spaceId === WORKSPACE ? `${spaceId}#${userId}` : spaceId;

  console.log("json", json);
  const push = pushRequestSchema.parse(json);
  if (push.mutations.length === 0) {
    console.log("no mutations");
    return NextResponse.json({});
  }
  const t0 = Date.now();

  const processMutations = async () => {
    const clientIDs = [...new Set(push.mutations.map((m) => m.clientID))];

    const lastMutationIds = await getLastMutationIds({
      clientGroupID: push.clientGroupID,
      clientIDs,
    });
    let updated = false;

    console.log("lastMutationIDs:", lastMutationIds);
    console.log("clientId", clientIDs);

    const tx = new ReplicacheTransaction(adjustedSpaceId, userId);

    for (let i = 0; i < push.mutations.length; i++) {
      const mutation = push.mutations[i] as Mutation;

      const lastMutationId = lastMutationIds[mutation.clientID] || 0;
      if (mutation.name === "publishWork") {
        const params = z
          .object({
            id: z.string(),
            type: z.enum(WorkTypeEnum),
            publishedAt: z.string(),
          })
          .parse(mutation.args);
        if (params.type === "QUEST") {
          published.quests = true;
        }
        if (params.type === "POST") {
          published.post = true;
        }
        if (params.type === "SOLUTION") {
          published.solution = true;
        }
      }
      // try {
      const nextMutationId = await processMutation({
        tx,
        lastMutationId,
        mutation,
        userId,
        spaceId: adjustedSpaceId,
      });
      lastMutationIds[mutation.clientID] = nextMutationId;
      if (nextMutationId > lastMutationId) {
        updated = true;
      }
      // } catch (error) {
      //   if (error instanceof Error) {
      //     if (error.message === "UNAUTHORIZED") {
      //       throw new Error("UNAUTHORISED");
      //     }
      //   }
      //   const nextMutationId = processMutation({
      //     tx,
      //     lastMutationId,
      //     mutation,
      //     error,
      //     userId,
      //   });

      //   lastMutationIds[mutation.clientID] = nextMutationId
      //     ? nextMutationId
      //     : lastMutationId;
      // }
    }
    if (updated) {
      await Promise.all([
        setLastMutationIds({
          clientGroupId: push.clientGroupID,
          lmids: lastMutationIds,
        }),

        tx.flush(),
      ]);
    } else {
      console.log("Nothing to update");
    }
  };
  try {
    await processMutations();
    if (
      env.PUSHER_APP_ID &&
      env.PUSHER_SECRET &&
      env.NEXT_PUBLIC_PUSHER_KEY &&
      env.NEXT_PUBLIC_PUSHER_CLUSTER
    ) {
      console.log("start poking");
      const startPoke = Date.now();

      const pusher = new Pusher({
        appId: env.PUSHER_APP_ID,
        key: env.NEXT_PUBLIC_PUSHER_KEY,
        secret: env.PUSHER_SECRET,
        cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
        useTLS: true,
      });

      if (spaceId === WORKSPACE) {
        if (published.quests) {
          await Promise.allSettled([
            pusher.trigger(PUBLISHED_QUESTS, "poke", {}),
            pusher.trigger(WORKSPACE, "poke", {}),
          ]);
        } else {
          await pusher.trigger(WORKSPACE, "poke", {});
        }
        // if (published.quests) {
        //   const result = await momentoTopic.publish(
        //     env.NEXT_PUBLIC_MOMENTO_CACHE_NAME,
        //     PUBLISHED_QUESTS,
        //     "test-topic-value"
        //   );
        //   if (result instanceof TopicPublish.Success) {
        //     console.log(`Value published to topic ${PUBLISHED_QUESTS}`);
        //   } else if (result instanceof TopicPublish.Error) {
        //     console.log(
        //       `An error occurred while attempting to publish to the topic 'test-topic' in cache 'test-cache': ${result.errorCode()}: ${result.toString()}`
        //     );
        //   }
        // }

        // const result = await momentoTopic.publish(
        //   env.NEXT_PUBLIC_MOMENTO_CACHE_NAME,
        //   WORKSPACE,
        //   "test-topic-value"
        // );
        // if (result instanceof TopicPublish.Success) {
        //   console.log(`Value published to topic ${WORKSPACE}`);
        // } else if (result instanceof TopicPublish.Error) {
        //   console.log(
        //     `An error occurred while attempting to publish to the topic 'test-topic' in cache 'test-cache': ${result.errorCode()}: ${result.toString()}`
        //   );
        // }
      }
      if (spaceId === PUBLISHED_QUESTS) {
        await pusher.trigger(PUBLISHED_QUESTS, "poke", {});
        // const result = await momentoTopic.publish(
        //   env.NEXT_PUBLIC_MOMENTO_CACHE_NAME,
        //   PUBLISHED_QUESTS,
        //   "poke"
        // );
        // if (result instanceof TopicPublish.Success) {
        //   console.log(`Value published to topic ${PUBLISHED_QUESTS}`);
        // } else if (result instanceof TopicPublish.Error) {
        //   console.log(
        //     `An error occurred while attempting to publish to the topic 'test-topic' in cache 'test-cache': ${result.errorCode()}: ${result.toString()}`
        //   );
        // }
      }
      console.log("Poke took", Date.now() - startPoke);
    } else {
      console.log("Not poking because Pusher is not configured");
    }
  } catch (error) {
    console.log(error);
    throw new Error("push error");
  }

  console.log("Processed all mutations in", Date.now() - t0);

  return NextResponse.json({});
}

const processMutation = async ({
  tx,
  mutation,
  error,
  lastMutationId,
  userId,
  spaceId,
}: {
  tx: ReplicacheTransaction;
  mutation: Mutation;
  lastMutationId: number;
  error?: any;
  userId: string;
  spaceId: string;
}) => {
  const expectedMutationID = lastMutationId + 1;
  if (mutation.id < expectedMutationID) {
    console.log(
      `Mutation ${mutation.id} has already been processed - skipping`
    );
    return lastMutationId;
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
    await WorkspaceMutations({ tx, mutation, spaceId });
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
    return lastMutationId;
  }
};
