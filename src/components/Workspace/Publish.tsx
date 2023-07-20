/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { UndoManager } from "@rocicorp/undo";
import { useCallback, useRef, useState } from "react";
import { z } from "zod";
import { MergedWork, Quest } from "~/types/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/ui/AlertDialog";
import { Button } from "~/ui/Button";
import { UpdateAttributeErrorsZod, WorkspaceStore } from "~/zustand/workspace";

import { Editor } from "@tiptap/react";
import { toast } from "sonner";
import * as Y from "yjs";
const Publish = ({
  work,
  editor,
  ydoc,
  isAuthorised,
}: {
  work: MergedWork;
  editor: Editor;
  ydoc: Y.Doc;
  isAuthorised: boolean;
}) => {
  const [isValid, setIsValid] = useState(false);
  const rep = WorkspaceStore((state) => state.rep);
  const setAttributeErrors = WorkspaceStore(
    (state) => state.setAttributeErrors
  );
  const undoManagerRef = useRef(new UndoManager());

  const QuestAttributesZod = z.object({
    id: z.string(),
    title: z.string().min(1, { message: "Missing title" }),
    subtopic: z.array(z.string()).min(1, { message: "Missing subtopic" }),
    topic: z.string(),
    reward: z
      .number()
      .min(1, { message: "Number of diamonds must be greater than 1" }),
    slots: z
      .number()
      .min(1, { message: "Number of slots must be more than 1" })
      .max(100, { message: "Number of slots must be less than 100" }),
    deadline: z.coerce.date().refine(
      (val) => {
        const currentDate = new Date();
        return val > currentDate;
      },
      {
        message: "Deadline must be in the future",
      }
    ),
  });
  const SolutionAttributesZod = z.object({
    id: z.string(),
    title: z.string(),
    questId: z.string(),
    questCreatorId: z.string(),
  });

  const validate = () => {
    if (work && work.type === "QUEST") {
      const result = QuestAttributesZod.safeParse(work);

      if (!result.success) {
        const errors: Record<string, { error: boolean; message: string }> = {};
        result.error.issues.forEach(
          (e) =>
            (errors[e.path[0] as string] = {
              error: true,
              message: e.message.startsWith("Expected")
                ? "Invalid input"
                : e.message,
            })
        );
        const newAttributeErrors = UpdateAttributeErrorsZod.parse(errors);
        setAttributeErrors(newAttributeErrors);
        setIsValid(false);
        toast.error("Fill in all the necessary inputs");
      } else {
        setIsValid(true);
      }
    }
    if (work && work.type === "SOLUTION") {
      const result = SolutionAttributesZod.safeParse(work);

      if (!result.success) {
        const errors: Record<string, { error: boolean; message: string }> = {};
        result.error.issues.forEach(
          (e) =>
            (errors[e.path[0] as string] = { error: true, message: e.message })
        );

        const newAttributeErrors = UpdateAttributeErrorsZod.parse(errors);
        setAttributeErrors(newAttributeErrors);

        setIsValid(false);
        toast.error("Fill in all the necessary inputs");
      } else {
        setIsValid(true);
      }
    }
  };

  const handleQuestPublish = useCallback(async () => {
    const publishedAt = new Date().toISOString();

    if (rep) {
      await undoManagerRef.current.add({
        execute: () =>
          rep.mutate.publishWork({
            params: {
              id: work.id,
              publishedAt,
              published: true,
              status: "OPEN",
              type: "QUEST",

              solversCount: 0,
              textContent: editor.getText(),
            },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            markdown: editor.storage.markdown.getMarkdown(),
          }),
        undo: () => rep.mutate.unpublishWork({ id: work.id, type: work.type }),
      });
      toast.success("Successfully published quest!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center">
      <Button
        className="mt-3 w-full bg-emerald-500 text-white hover:bg-emerald-600"
        onClick={() => {
          if (!isAuthorised) {
            toast.error(
              "Permission denied. Only creator or signed in user is allowed to publish"
            );
          } else {
            validate();
          }
        }}
      >
        Publish
      </Button>
      <AlertDialog open={isValid}>
        <AlertDialogContent className="border-slate-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm publish</AlertDialogTitle>
            {work.type === "QUEST" ? (
              <AlertDialogDescription>
                <p className="flex">
                  <p>You will pay</p>
                  <p className="px-1 font-semibold text-violet-500">{`${
                    (work as Quest)?.reward || 0
                  } diamonds`}</p>
                  <p> for publishing the quest.</p>
                </p>
                <p className="font-bold">
                  Note: Once you viewed the solution posted to this quest, the
                  quest can not be unpublished or deleted.
                </p>
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription></AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-end">
            <AlertDialogCancel onClick={() => setIsValid((old) => !old)}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={() => {
                if (work.type === "QUEST")
                  handleQuestPublish().catch((err) => console.log(err));
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default Publish;
