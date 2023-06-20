import { MergedWorkType, Quest, Solution, WorkType } from "~/types/types";
import {
  NonEditableContent,
  NonEditableQuestAttributes,
  NonEditableSolutionAttributes,
} from "./NonEditableAttributes";

export const Preview = ({
  work,
  content,
}: {
  work: WorkType;
  content: string;
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
