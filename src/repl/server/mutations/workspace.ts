import { z } from "zod";
import { Mutation, idSchema } from "~/app/api/replicache-push/route";
import { getItem } from "~/repl/data";
import { contentKey, workKey } from "~/repl/mutators";
import { ReplicacheTransaction } from "~/repl/transaction";
import {
  Content,
  Entity,
  PublishWorkAttributesZod,
  PublishedQuestZod,
  Quest,
  WorkType,
  WorkTypeEnum,
  WorkUpdatesZod,
  WorkZod,
} from "~/types/types";
const updateWorkArgsSchema = z.object({
  id: z.string(),
  type: z.enum(WorkTypeEnum),
  updates: WorkUpdatesZod,
});

export const WorkspaceMutations = async ({
  tx,
  mutation,
  spaceId,
}: {
  tx: ReplicacheTransaction;
  mutation: Mutation;
  spaceId: string;
}) => {
  if (mutation.name === "createWork") {
    const { work } = z.object({ work: WorkZod }).parse(mutation.args);
    const newContent: Content = {
      type: "CONTENT",
      version: 1,
    };

    tx.put({
      key: workKey({ id: work.id, type: work.type as WorkType }),
      value: work,
    });
    tx.put({ key: contentKey(work.id), value: newContent });
  } else if (mutation.name === "deleteWork") {
    const params = z
      .object({ id: z.string(), type: z.enum(WorkTypeEnum) })
      .parse(mutation.args);
    tx.del({ key: workKey({ id: params.id, type: params.type }) });
  } else if (mutation.name === "deleteWorkPermanently") {
    const params = z
      .object({ id: z.string(), type: z.enum(WorkTypeEnum) })
      .parse(mutation.args);
    tx.permDel({ key: workKey({ id: params.id, type: params.type }) });
    tx.permDel({ key: contentKey(params.id) });
  } else if (mutation.name === "duplicateWork") {
    const { id, newId, createdAt, lastUpdated, type } = z
      .object({
        id: z.string(),
        newId: z.string(),
        lastUpdated: z.string(),
        createdAt: z.string(),
        type: z.enum(WorkTypeEnum),
      })
      .parse(mutation.args);
    const result = await Promise.all([
      getItem({ key: workKey({ id, type }), spaceId }),
      getItem({ key: contentKey(id), spaceId }),
    ]);
    if (result) {
      tx.put({
        key: workKey({ id: newId, type }),
        value: {
          ...result[0],
          id: newId,
          lastUpdated,
          createdAt,
          collaborators: [],
        },
      });
      tx.put({
        key: contentKey(newId),
        value: { ...result[1], collaborators: [] },
      });
    }
  } else if (mutation.name === "updateWork") {
    const updateWorkParams = updateWorkArgsSchema.parse(mutation.args);
    tx.update({
      key: workKey({ id: updateWorkParams.id, type: updateWorkParams.type }),
      value: updateWorkParams.updates,
    });
  } else if (mutation.name === "restoreWork") {
    const params = z
      .object({ id: z.string(), type: z.enum(WorkTypeEnum) })
      .parse(mutation.args);
    tx.restore({ key: workKey({ id: params.id, type: params.type }) });
  } else if (mutation.name === "updateContent") {
    const content = z
      .object({
        id: z.string(),
        update: z.object({
          Ydoc: z.string(),
          textContent: z.optional(z.string()),
        }),
      })
      .parse(mutation.args);
    tx.update({ key: contentKey(content.id), value: content.update });
  } else if (mutation.name === "publishWork") {
    const params = PublishWorkAttributesZod.parse(mutation.args);
    const [quest, content] = (await Promise.all([
      getItem({ spaceId, key: workKey({ id: params.id, type: params.type }) }),
      getItem({
        spaceId,
        key: contentKey(params.id),
      }),
    ])) as [Quest, Content];
    console.log("quest", quest);
    PublishedQuestZod.parse({ ...quest, ...params });
    tx.update({
      key: workKey({ id: params.id, type: params.type }),
      value: {
        published: true,
        publishedQuestKey: params.id,
        publishedAt: params.publishedAt,
        textContent: content.textContent,
        publisherUsername: params.publisherUsername,
        solverCount: params.solverCount,
        ...(params.publisherProfile && {
          publisherProfile: params.publisherProfile,
        }),
      },
    });
    tx.update({
      key: contentKey(params.id),
      value: {
        publishedQuestKey: params.id,
      },
    });
  } else if (mutation.name === "unpublishWork") {
    const params = z
      .object({ id: z.string(), type: z.enum(WorkTypeEnum) })
      .parse(mutation.args);
    tx.update({
      key: workKey({ id: params.id, type: params.type }),
      value: { published: false, publishedKey: null },
    });
  }
};
