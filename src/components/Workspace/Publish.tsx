import React, { Dispatch, SetStateAction, useState } from "react";
import { z } from "zod";

import { YJSContentZod, Post, Quest, QuestZod, Solution } from "~/types/types";
import { Button } from "~/ui/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/ui/AlertDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/Dialog";
import Preview from "./Preview";
import { UpdateAttributeErrorsZod, WorkspaceStore } from "~/zustand/workspace";

const Publish = ({
  work,
  content,
}: {
  work: Quest & Solution & Post;
  content: string | undefined;
}) => {
  const [isValid, setIsValid] = useState(false);
  const setAttributeErrors = WorkspaceStore(
    (state) => state.setAttributeErrors
  );

  const QuestAttributesZod = z.object({
    id: z.string(),
    title: z.string().min(1, { message: "Missing title" }),
    subtopic: z.array(z.string()).min(1, { message: "Missing subtopic" }),
    topic: z.string(),
    content: z.string(),
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
    content: z.string(),
    questId: z.string(),
    questCreatorId: z.string(),
  });

  const validate = () => {
    if (work && work.type === "QUEST") {
      const result = QuestAttributesZod.safeParse(work);

      if (!result.success) {
        console.log("error", result.error.issues);
        const errors: Record<string, { error: boolean; message: string }> = {};
        result.error.issues.forEach(
          (e) =>
            (errors[e.path[0] as string] = { error: true, message: e.message })
        );
        console.log("errors", errors);
        const newAttributeErrors = UpdateAttributeErrorsZod.parse(errors);
        setAttributeErrors(newAttributeErrors);
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    }
    if (work && work.type === "SOLUTION") {
      const result = SolutionAttributesZod.safeParse(work);

      if (!result.success) {
        console.log("error", result.error.issues);
        const errors: Record<string, { error: boolean; message: string }> = {};
        result.error.issues.forEach(
          (e) =>
            (errors[e.path[0] as string] = { error: true, message: e.message })
        );
        console.log("errors", errors);

        const newAttributeErrors = UpdateAttributeErrorsZod.parse(errors);
        setAttributeErrors(newAttributeErrors);

        setIsValid(false);
      } else {
        setIsValid(true);
      }
    }
  };

  const handlePublish = ({
    solutionId,
    questId,
  }: {
    solutionId?: string;
    questId?: string;
  }) => {
    return;
  };

  return (
    <div className="flex items-center justify-center">
      <Button
        className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600"
        onClick={() => {
          validate();
        }}
      >
        Publish
      </Button>
      <AlertDialog open={isValid}>
        {/* <AlertDialogTrigger asChild> */}

        {/* </AlertDialogTrigger> */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm publish</AlertDialogTitle>
            {work.type === "QUEST" ? (
              <AlertDialogDescription>
                You will pay {(work as Quest)?.reward || 0}
                diamonds for publishing the quest.
                <p className="font-bold">
                  Note: Once publisher viewed the solution, quest can not be
                  unpublished or deleted.
                </p>
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription></AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Dialog>
              <DialogTrigger>
                <Button className="mt-3 w-full bg-amber-400 hover:bg-amber-500">
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Preview</DialogTitle>
                  <DialogDescription>
                    {content && work && (
                      <Preview work={work} content={content} />
                    )}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <AlertDialogAction className="bg-emerald-500 hover:bg-emerald-600">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default Publish;
