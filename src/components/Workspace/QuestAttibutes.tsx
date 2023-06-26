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
  const attributeErrors = WorkspaceStore((state) => state.attributeErrors);
  const setAttributeErrors = WorkspaceStore(
    (state) => state.setAttributeErrors
  );
  const rep = WorkspaceStore((state) => state.rep);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTitleChange = useCallback(
    debounce(async (title: string) => {
      setAttributeErrors({ title: { error: false } });
      if (rep) {
        await rep.mutate.updateWork({
          id: quest.id,
          updates: { title },
        });
      }
    }, 1000),
    []
  );
  const handleTopicChange = async (topic: TopicsType) => {
    setAttributeErrors({ topic: { error: false } });
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
    setAttributeErrors({ subtopic: { error: false } });
    const strings = subtopics.map((val) => val.value);
    if (rep) {
      await rep.mutate.updateWork({
        id: quest.id,
        updates: { subtopic: strings },
      });
    }
  };
  const handleRewardChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setAttributeErrors({ reward: { error: false } });
    const reward = e.currentTarget.valueAsNumber || 0;
    if (rep) {
      await rep.mutate.updateWork({
        id: quest.id,
        updates: { reward },
      });
    }
  };
  const handleSlotsChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setAttributeErrors({ slots: { error: false } });
    const slots = e.currentTarget.valueAsNumber || 0;
    if (rep) {
      await rep.mutate.updateWork({
        id: quest.id,
        updates: { slots },
      });
    }
  };

  const handleDateChange = async (date: Date | undefined) => {
    setAttributeErrors({ deadline: { error: false } });
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
    <div className="flex flex-col">
      <Title
        placeholder="Untitled"
        handleTitleChange={handleTitleChange}
        title={quest.title}
        error={attributeErrors.title}
      />

      <TopicSelect
        handleTopicChange={handleTopicChange}
        topic={quest.topic}
        error={attributeErrors.topic}
      />

      <Subtopic
        handleSubtopicChange={handleSubtopicChange}
        subtopic={quest.subtopic}
        error={attributeErrors.subtopic}
      />
      <div className="flex flex-wrap items-center gap-1">
        <Reward
          handleRewardChange={handleRewardChange}
          reward={quest.reward}
          error={attributeErrors.reward}
        />
        <Slots
          handleSlotsChange={handleSlotsChange}
          slots={quest.slots}
          error={attributeErrors.slots}
        />
      </div>

      <DatePicker
        handleDateChange={handleDateChange}
        date={quest.deadline}
        error={attributeErrors.deadline}
      />
    </div>
  );
};

export default QuestAttributes;
