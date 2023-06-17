import { ChangeEvent, FormEvent } from "react";
import { Quest, TopicsType, UpdateQueue, WorkUpdates } from "../../types/types";

import { WorkspaceStore } from "../../zustand/workspace";
import {
  DatePicker,
  OptionType,
  Reward,
  Slots,
  Subtopic,
  Title,
  TopicSelect,
} from "./Attributes";
import { MultiValue, SingleValue } from "react-select";

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
    lastUpdate: WorkUpdates;
  }) => Promise<void> | undefined;
}) => {
  const updateQuestAttributesListAttribute = WorkspaceStore(
    (state) => state.updateListState
  );
  const addUpdate = WorkspaceStore((state) => state.addUpdate);
  const updateQueue = WorkspaceStore((state) => state.updateQueue);

  const handleTitleChange = async (e: FormEvent<HTMLTextAreaElement>) => {
    addUpdate({
      id: quest.id,
      value: { title: e.currentTarget.value },
    });
    // updateQuestAttributesListAttribute({
    //   id: quest.id,
    //   type: "QUEST",
    //   attribute: "title",
    //   value: e.currentTarget.textContent as string,
    // });

    await updateAttributesHandler({
      updateQueue,
      lastUpdate: {
        title: e.currentTarget.value,
      },
    });
  };

  const handleTopicChange = async (value: string) => {
    addUpdate({
      id: quest.id,
      value: {
        topic: value as TopicsType,
      },
    });
    // updateQuestAttributesListAttribute({
    //   id: quest.id,
    //   attribute: "topic",
    //   type: "QUEST",
    //   value: value,
    // });
    await updateAttributesHandler({
      updateQueue,
      lastUpdate: {
        topic: value as TopicsType,
      },
    });
  };

  const handleSubtopicChange = async ({
    subtopics,
  }: {
    subtopics: MultiValue<OptionType>;
  }) => {
    const strings = subtopics.map((val) => val.value);
    console.log("strings,", strings);
    addUpdate({
      id: quest.id,
      value: {
        subtopic: strings,
      },
    });
    await updateAttributesHandler({
      updateQueue,
      lastUpdate: {
        subtopic: strings,
      },
    });
  };
  const handleRewardChange = async (e: ChangeEvent<HTMLInputElement>) => {
    addUpdate({
      value: { reward: e.currentTarget.valueAsNumber || 0 },
      id: quest.id,
    });
    await updateAttributesHandler({
      updateQueue,
      lastUpdate: {
        reward: e.currentTarget.valueAsNumber || 0,
      },
    });
  };
  const handleSlotsChange = async (e: ChangeEvent<HTMLInputElement>) => {
    addUpdate({
      id: quest.id,
      value: {
        slots: e.currentTarget.valueAsNumber || 0,
      },
    });
    await updateAttributesHandler({
      updateQueue,
      lastUpdate: {
        slots: e.currentTarget.valueAsNumber || 0,
      },
    });
  };
  const handleDateChange = async (event: Date | undefined) => {
    if (event) {
      addUpdate({
        id: quest.id,
        value: {
          deadline: event.toISOString(),
        },
      });
      await updateAttributesHandler({
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
      <div className="flex items-center gap-2">
        <Reward handleRewardChange={handleRewardChange} reward={quest.reward} />
        <Slots handleSlotsChange={handleSlotsChange} slots={quest.slots} />
      </div>

      <DatePicker handleDateChange={handleDateChange} date={quest.deadline} />
    </div>
  );
};

export default QuestAttributes;
