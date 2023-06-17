import { Quest, Solution } from "~/types/types";
import {
  NonEditableContent,
  NonEditableQuestAttributes,
  NonEditableSolutionAttributes,
} from "./NonEditableAttributes";

export const Preview = ({
  quest,
  solution,
  content,
  type,
}: {
  quest?: Quest;
  content?: string;
  solution?: Solution;
  type: "SOLUTION" | "QUEST";
}) => {
  if (type === "QUEST" && quest) {
    return (
      <>
        <NonEditableQuestAttributes quest={quest} />

        {content && <NonEditableContent content={content} />}
      </>
    );
  }
  if (type === "SOLUTION" && solution) {
    return (
      <>
        <NonEditableSolutionAttributes solution={solution} />
        {content && <NonEditableContent content={content} />}
      </>
    );
  }
  return <>hello</>;
};
export default Preview;
