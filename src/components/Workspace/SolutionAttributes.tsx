import { useRef } from "react";

import { Solution } from "~/types/types";
import { WorkspaceStore } from "../../zustand/workspace";

const SolutionAttributes = ({ solution }: { solution: Solution }) => {
  const { id } = solution;

  const updateQueue = WorkspaceStore((state) => state.updateQueue);
  const titlePlaceholderText = "Write title here";
  const titleRef = useRef<HTMLDivElement>(null);

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
  return <></>;
};

export default SolutionAttributes;
