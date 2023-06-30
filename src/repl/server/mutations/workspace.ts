import { z } from "zod";
import { Mutation, idSchema } from "~/app/api/replicache-push/route";
import { getItem } from "~/repl/data";
import { YJSKey, workKey } from "~/repl/mutators";
import { ReplicacheTransaction } from "~/repl/transaction";
import { Content, Entity, WorkUpdatesZod, WorkZod } from "~/types/types";
const updateWorkArgsSchema = z.object({
  id: z.string(),
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
      inTrash: false,
      published: false,
      type: "CONTENT",
      version: 1,
    };

    tx.put({ key: workKey(work.id), value: work });
    tx.put({ key: YJSKey(work.id), value: newContent });
  } else if (mutation.name === "deleteWork") {
    const idParams = idSchema.parse(mutation.args);
    tx.del({ key: workKey(idParams.id) });
  } else if (mutation.name === "deleteWorkPermanently") {
    const idParams = idSchema.parse(mutation.args);
    tx.permDel({ key: workKey(idParams.id) });
  } else if (mutation.name === "duplicateWork") {
    const { id, newId, createdAt, lastUpdated } = z
      .object({
        id: z.string(),
        newId: z.string(),
        lastUpdated: z.string(),
        createdAt: z.string(),
      })
      .parse(mutation.args);
    const result = await Promise.all([
      getItem({ key: workKey(id), spaceId }),
      getItem({ key: YJSKey(id), spaceId }),
    ]);
    if (result) {
      tx.put({
        key: workKey(newId),
        value: {
          ...result[0],
          id: newId,
          lastUpdated,
          createdAt,
          collaborators: [],
        },
      });
      tx.put({
        key: YJSKey(newId),
        value: { ...result[1], collaborators: [] },
      });
    }
  } else if (mutation.name === "updateWork") {
    const updateWorkParams = updateWorkArgsSchema.parse(mutation.args);
    tx.update({
      key: workKey(updateWorkParams.id),
      value: updateWorkParams.updates,
    });
  } else if (mutation.name === "restoreWork") {
    const idParams = idSchema.parse(mutation.args);
    tx.restore({ key: workKey(idParams.id) });
  } else if (mutation.name === "updateYJS") {
    const content = z
      .object({ id: z.string(), update: z.object({ Ydoc: z.string() }) })
      .parse(mutation.args);
    tx.update({ key: YJSKey(content.id), value: content.update });
  } else if (mutation.name === "publishWork") {
    const params = z
      .object({
        id: z.string(),
        type: z.enum(["POST", "SOLUTION", "QUEST"] as const),
      })
      .parse(mutation.args);
    tx.update({
      key: workKey(params.id),
      value: {
        published: true,
        publishedKey: `PUBLISHED#${params.type}#${params.id}`,
      },
    });
  } else if (mutation.name === "unpublishWork") {
    const idParams = idSchema.parse(mutation.args);
    tx.update({
      key: workKey(idParams.id),
      value: { published: false, publishedKey: null },
    });
  }
};
