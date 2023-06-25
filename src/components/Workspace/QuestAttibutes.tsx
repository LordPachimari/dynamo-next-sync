import { ChangeEvent, FormEvent, useCallback } from "react";
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
import debounce from "lodash.debounce";

const QuestAttributes = ({ quest }: { quest: Quest }) => {
  const updateQueue = WorkspaceStore((state) => state.updateQueue);
  const addUpdate = WorkspaceStore((state) => state.addUpdate);
  const attributeErrors = WorkspaceStore((state) => state.attributeErrors);
  const rep = WorkspaceStore((state) => state.rep);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTitleChange = useCallback(
    debounce(async (e: FormEvent<HTMLTextAreaElement>) => {
      if (rep) {
        await rep.mutate.updateWork({
          id: quest.id,
          updates: { title: e.currentTarget.value },
        });
      }
    }, 1000),
    []
  );
  const handleTopicChange = async (topic: TopicsType) => {
    if (rep) {
      await rep.mutate.updateWork({
        id: quest.id,
        updates: { topic },
      });
    }
  };

  const handleSubtopicChange = async ({
    subtopics,
  }: {
    subtopics: MultiValue<OptionType>;
  }) => {
    const strings = subtopics.map((val) => val.value);
    if (rep) {
      await rep.mutate.updateWork({
        id: quest.id,
        updates: { subtopic: strings },
      });
    }
  };
  const handleRewardChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const reward = e.currentTarget.valueAsNumber || 0;
    if (rep) {
      await rep.mutate.updateWork({
        id: quest.id,
        updates: { reward },
      });
    }
  };
  const handleSlotsChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const slots = e.currentTarget.valueAsNumber || 0;
    if (rep) {
      await rep.mutate.updateWork({
        id: quest.id,
        updates: { slots },
      });
    }
  };

  const handleDateChange = async (date: Date | undefined) => {
    if (date) {
      if (rep) {
        await rep.mutate.updateWork({
          id: quest.id,
          updates: { deadline: date.toISOString() },
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Title
        placeholder="Untitled"
        handleTitleChange={handleTitleChange}
        title={quest.title}
        error={attributeErrors.title}
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
