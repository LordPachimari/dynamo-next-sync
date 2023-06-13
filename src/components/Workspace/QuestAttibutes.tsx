import { ChangeEvent, FormEvent } from "react";
import { Quest, TopicsType, UpdateQueue, WorkUpdate } from "../../types/types";

import { WorkspaceStore } from "../../zustand/workspace";
import {
  DatePicker,
  Reward,
  Slots,
  Subtopic,
  Title,
  TopicSelect,
} from "./Attributes";

const QuestAttributes = ({
  quest,
  updateAttributesHandler,
}: {
  quest: Quest;
  updateAttributesHandler: ({
    updateQueue,
    lastUpdate,
  }: {
    updateQueue: UpdateQueue;
    lastUpdate: WorkUpdate;
  }) => void;
}) => {
  const updateQuestAttributesListAttribute = WorkspaceStore(
    (state) => state.updateListState
  );
  const addUpdate = WorkspaceStore((state) => state.addUpdate);
  const updateQueue = WorkspaceStore((state) => state.updateQueue);

  const handleTitleChange = (e: FormEvent<HTMLTextAreaElement>) => {
    addUpdate({
      id: quest.id,
      value: { title: e.currentTarget.textContent as string },
    });
    // updateQuestAttributesListAttribute({
    //   id: quest.id,
    //   type: "QUEST",
    //   attribute: "title",
    //   value: e.currentTarget.textContent as string,
    // });

    updateAttributesHandler({
      updateQueue,
      lastUpdate: {
        title: e.currentTarget.textContent as string,
      },
    });
  };

  const handleTopicChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TopicsType;

    addUpdate({
      id: quest.id,
      value: {
        topic: value,
      },
    });
    // updateQuestAttributesListAttribute({
    //   id: quest.id,
    //   attribute: "topic",
    //   type: "QUEST",
    //   value: value,
    // });
    updateAttributesHandler({
      updateQueue,
      lastUpdate: {
        topic: value,
      },
    });
  };

  const handleSubtopicChange = () => {
    const content = document.getElementById("subtopic");

    const subtopicValues: string[] = [];
    content?.childNodes.forEach((c) => {
      if (c.textContent) {
        subtopicValues.push(c.textContent);
      }
    });
    if (subtopicValues.length > 0) {
      addUpdate({
        id: quest.id,
        value: {
          subtopic: subtopicValues,
        },
      });
      updateAttributesHandler({
        updateQueue,
        lastUpdate: {
          subtopic: subtopicValues,
        },
      });
    } else {
      addUpdate({
        id: quest.id,
        value: {
          subtopic: [],
        },
      });
      updateAttributesHandler({
        updateQueue,
        lastUpdate: {
          subtopic: [],
        },
      });
    }
  };
  const handleRewardChange = (e: ChangeEvent<HTMLInputElement>) => {
    addUpdate({
      value: { reward: e.currentTarget.valueAsNumber || 0 },
      id: quest.id,
    });
    updateAttributesHandler({
      updateQueue,
      lastUpdate: {
        reward: e.currentTarget.valueAsNumber || 0,
      },
    });
  };
  const handleSlotsChange = (e: ChangeEvent<HTMLInputElement>) => {
    addUpdate({
      id: quest.id,
      value: {
        slots: e.currentTarget.valueAsNumber || 0,
      },
    });
    updateAttributesHandler({
      updateQueue,
      lastUpdate: {
        slots: e.currentTarget.valueAsNumber || 0,
      },
    });
  };
  const handleDateChange = (event: Date | undefined) => {
    if (event) {
      addUpdate({
        id: quest.id,
        value: {
          deadline: event.toISOString(),
        },
      });
      updateAttributesHandler({
        lastUpdate: {
          deadline: event.toISOString(),
        },
        updateQueue,
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Title
        placeholder="Untitled"
        handleTitleChange={handleTitleChange}
        title={quest.title}
      />
      <TopicSelect handleTopicChange={handleTopicChange} topic={quest.topic} />
      <Subtopic
        handleSubtopicChange={handleSubtopicChange}
        subtopic={quest.subtopic}
      />
      <Reward handleRewardChange={handleRewardChange} reward={quest.reward} />
      <Slots handleSlotsChange={handleSlotsChange} slots={quest.slots} />
      <DatePicker handleDateChange={handleDateChange} date={quest.deadline} />
    </div>
  );
};

export default QuestAttributes;
