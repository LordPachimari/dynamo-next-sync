import { yDocToProsemirrorJSON } from "y-prosemirror";
import { z } from "zod";
import { Mutation } from "~/app/api/replicache-push/route";
import { getItem } from "~/repl/data";
import { ReplicacheTransaction } from "~/repl/transaction";
import * as Y from "yjs";
import * as base64 from "base64-js";
import {
  Content,
  MergedWorkType,
  PublishWorkParamsZod,
  PublishedPostZod,
  PublishedQuestZod,
  PublishedSolutionZod,
  Quest,
  WorkType,
  WorkTypeEnum,
  WorkUpdatesZod,
  WorkZod,
} from "~/types/types";
import { contentKey, workKey } from "~/repl/mutators/workspace";
const updateWorkArgsSchema = z.object({
  id: z.string(),
  type: z.enum(WorkTypeEnum),
  updates: WorkUpdatesZod,
});

export const WorkspaceMutations = async ({
  tx,
  mutation,
  spaceId,
  userId,
}: {
  tx: ReplicacheTransaction;
  mutation: Mutation;
  spaceId: string;
  userId: string;
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
    const params = PublishWorkParamsZod.parse(mutation.args);
    const [work, content] = (await Promise.all([
      getItem({ spaceId, key: workKey({ id: params.id, type: params.type }) }),
      getItem({
        spaceId,
        key: contentKey(params.id),
      }),
    ])) as [MergedWorkType, Content];
    console.log("work", work);
    if (params.type === "QUEST") {
      PublishedQuestZod.parse({ ...work, ...params });
    }

    if (params.type === "POST") {
      PublishedPostZod.parse({ ...work, ...params });
    }
    if (params.type === "SOLUTION") {
      PublishedSolutionZod.parse({ ...work, ...params });
      tx.update({
        key: `SOLVER#${params.questId}#${userId}`,
        value: {
          status: "POSTED",
          solutionId: params.id,
        },
      });
    }
    tx.update({
      key: workKey({ id: params.id, type: params.type }),
      value: {
        ...params,
        textContent: content.textContent,
        ...((params.type === "QUEST" || params.type === "SOLUTION") && {
          publishedQuestKey: params.id,
        }),
        ...(params.type === "POST" &&
          params.destination === "FORUM" && {
            forumKey: params.id,
          }),

        ...(params.type === "POST" &&
          params.destination === "TALENT" && {
            talentKey: params.id,
          }),
      },
    });

    if (content.Ydoc) {
      const ydoc = new Y.Doc();
      const update = base64.toByteArray(content.Ydoc);
      Y.applyUpdateV2(ydoc, update);
      const proseMirrorJSON = yDocToProsemirrorJSON(ydoc, "content");
      tx.put({
        key: `PUBLISHED#${contentKey(params.id)}`,
        value: {
          publishedQuestKey: params.id,
          content: JSON.stringify(proseMirrorJSON),
          version: 1,
        },
      });
    }
  } else if (mutation.name === "unpublishWork") {
    const params = z
      .object({ id: z.string(), type: z.enum(WorkTypeEnum) })
      .parse(mutation.args);
    tx.update({
      key: workKey({ id: params.id, type: params.type }),
      value: { published: false, publishedKey: null },
    });
    tx.del({
      key: `PUBLISHED#${contentKey(params.id)}`,
    });
  }
};
