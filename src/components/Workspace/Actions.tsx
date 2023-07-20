"use client";
/* eslint-disable @typescript-eslint/no-misused-promises */
import { useAuth } from "@clerk/nextjs";
import { UndoManager } from "@rocicorp/undo";
import { BookOpenCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { ulid } from "ulid";
import { MergedWork, Quest } from "~/types/types";
import { Button } from "~/ui/Button";
import { STRANGER } from "~/utils/constants";
import { ReplicacheInstancesStore } from "~/zustand/rep";
import { WorkspaceStore } from "~/zustand/workspace";

export default function Actions() {
  const rep = WorkspaceStore((state) => state.rep);
  const { userId } = useAuth();
  const router = useRouter();

  const undoManagerRef = useRef(new UndoManager());

  const handleCreateQuest = useCallback(async () => {
    if (rep) {
      const id = ulid();
      const createdAt = new Date().toString();

      const newQuest: Quest = {
        id,
        createdAt,
        creatorId: userId || STRANGER,
        inTrash: false,
        lastUpdated: createdAt,
        published: false,
        type: "QUEST",
        version: 1,
      };
      // await rep.mutate.createQuest({ quest: newQuest });
      await undoManagerRef.current.add({
        execute: () =>
          rep.mutate.createWork({
            work: newQuest as MergedWork,
            type: "QUEST",
          }),
        undo: () => rep.mutate.deleteWork({ id: newQuest.id, type: "QUEST" }),
      });
      router.push(`/workspace/${id}?type=QUEST`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rep, userId]);
  return (
    <div className="mt-16 flex w-full flex-col gap-5 lg:w-80 ">
      <Button
        className="max-w-lg  bg-blue-9 text-white hover:bg-blue-10"
        onClick={handleCreateQuest}
      >
        <BookOpenCheck className="mr-2 h-6 w-6 text-white" />
        Create quest
      </Button>
      <Button
        className="max-w-lg bg-blue-9 text-white hover:bg-blue-10"
        onClick={() => toast("not done yet")}
      >
        Create solution
      </Button>
    </div>
  );
}
