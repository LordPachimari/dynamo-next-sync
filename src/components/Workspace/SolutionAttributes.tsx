import { FormEvent, useRef } from "react";

import { Solution, UpdateQueue, WorkUpdate } from "~/types/types";
import { WorkspaceStore } from "../../zustand/workspace";
import { Title } from "./Attributes";

const SolutionAttributes = ({
  solution,
  updateAttributesHandler,
}: {
  solution: Solution;
  updateAttributesHandler: ({
    updateQueue,
    lastUpdate,
  }: {
    updateQueue: UpdateQueue;
    lastUpdate: WorkUpdate;
  }) => void;
}) => {
  const { id } = solution;

  const updateSolutionListAttribute = WorkspaceStore(
    (state) => state.updateListState
  );
  const updateQueue = WorkspaceStore((state) => state.updateQueue);
  const titlePlaceholderText = "Write title here";
  const titleRef = useRef<HTMLDivElement>(null);
  const handleTitleChange = (e: FormEvent<HTMLTextAreaElement>) => {
    updateSolutionListAttribute({
      type: "SOLUTION",
      id,
      attribute: "title",
      value: e.currentTarget.textContent as string,
    });

    updateAttributesHandler({
      updateQueue,
      lastUpdate: {
        title: e.currentTarget.textContent as string,
      },
    });
  };

  //   const handleTitleFocus = () => {
  //     if (titleRef.current?.firstChild?.nodeType === 1) {
  //       titleRef.current.firstChild.remove();
  //       const r = document.createRange();

  //       r.setStart(titleRef.current, 0);
  //       r.setEnd(titleRef.current, 0);
  //       document.getSelection()?.removeAllRanges();
  //       document.getSelection()?.addRange(r);
  //     }
  //   };

  //   const handleTitleBlur = () => {
  //     if (titleRef.current?.textContent === "") {
  //       const placeholder = document.createElement("div");
  //       placeholder.textContent = titlePlaceholderText;
  //       placeholder.className = styles.titlePlaceholder as string;
  //       titleRef.current.appendChild(placeholder);
  //     }
  //   };
  if (!solution) {
    return <div>No data</div>;
  }
  return (
    <Title
      handleTitleChange={handleTitleChange}
      placeholder="Untitled"
      title={solution.title}
    />
  );
};

export default SolutionAttributes;
