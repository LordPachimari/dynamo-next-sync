import React, { Dispatch, SetStateAction, useState } from "react";
import { z } from "zod";

import { ContentZod, Post, Quest, QuestZod, Solution } from "~/types/types";
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

const Publish = ({
  questCreatorId,
  type,
  work,
  content,
  questId,
  solutionId,
}: {
  solutionId?: string;
  work: Quest & Solution & Post;
  content: string | undefined;
  questId?: string;
  questCreatorId?: string;

  type: "QUEST" | "SOLUTION";
}) => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [isInvalidating, setIsInvalidating] = useState(false);

  const QuestAttributesZod = z.object({
    id: z.string(),
    title: z.string(),
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
    content: z.instanceof(Uint8Array),
  });

  const cancelRef = React.useRef<any>();

  const validate = () => {
    if (type === "QUEST" && work) {
      const result = QuestAttributesZod.safeParse(work);

      if (!result.success) {
        console.log("error", result.error);
        setErrorMessage(
          result.error.issues[0]?.message.startsWith("Required")
            ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              `${result.error.issues[0]?.message} ${result.error.issues[0].path}`
            : result.error.issues[0]?.message
            ? result.error.issues[0].message
            : "Please fill all the quest attributes"
        );

        return false;
      }
    }
    if (type === "SOLUTION" && work) {
      const result = SolutionAttributesZod.safeParse(work);

      if (!result.success) {
        console.log("error", result.error.issues);
        setErrorMessage(
          result.error.issues[0]?.message.startsWith("Required")
            ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              `${result.error.issues[0]?.message} ${result.error.issues[0].path}`
            : result.error.issues[0]?.message
            ? result.error.issues[0].message
            : "Please fill all the quest attributes"
        );

        return false;
      }
      if (!questId) {
        setErrorMessage("Please, add the target quest to publish to");
        return false;
      }
    }
    return false;
  };

  const handlePublish = ({
    solutionId,
    questId,
  }: {
    solutionId?: string;
    questId?: string;
  }) => {
    if (questId && type === "QUEST") {
    }
    if (solutionId && type === "SOLUTION" && questId && questCreatorId) {
    }
  };

  return (
    <div className="flex items-center justify-center">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600"
            onClick={() => {
              validate();
              setErrorMessage(undefined);
            }}
          >
            Publish
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm publish</AlertDialogTitle>
            {type === "QUEST" ? (
              <AlertDialogDescription>
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                You will pay {(work as Quest)?.reward || 0}
                diamonds for publishing the quest.
                <p className="font-bold">
                  Note: Once publisher viewed the solution, quest can not be
                  unpublished or deleted.
                </p>
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription>
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Dialog>
              <DialogTrigger>
                <Button
                  className="mt-3 w-full bg-amber-400 hover:bg-amber-500"
                  onClick={() => {
                    validate();
                    setErrorMessage(undefined);
                  }}
                >
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Preview</DialogTitle>
                  <DialogDescription>
                    {type === "QUEST" ? (
                      <Preview quest={work} content={content} type="QUEST" />
                    ) : (
                      <Preview
                        solution={work}
                        content={content}
                        type="SOLUTION"
                      />
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
