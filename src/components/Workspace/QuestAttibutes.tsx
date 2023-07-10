import { ChangeEvent, useCallback, useEffect } from "react";
import { Quest, Topic, WorkType } from "../../types/types";

import debounce from "lodash.debounce";
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

const QuestAttributes = ({ quest }: { quest: Quest }) => {
  const attributeErrors = WorkspaceStore((state) => state.attributeErrors);
  const setAttributeErrors = WorkspaceStore(
    (state) => state.setAttributeErrors
  );
  const resetAttributeErrors = WorkspaceStore((state) => state.resetErrors);
  const rep = WorkspaceStore((state) => state.rep);
  useEffect(() => {
    resetAttributeErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quest]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTitleChange = useCallback(
    debounce(async (title: string) => {
      setAttributeErrors({ title: { error: false } });
      if (rep) {
        await rep.mutate.updateWork({
          id: quest.id,
          updates: { title },
          type: quest.type as WorkType,
        });
      }
    }, 1000),
    []
  );
  const handleTopicChange = async (topic: Topic) => {
    setAttributeErrors({ topic: { error: false } });
    if (rep) {
      await rep.mutate.updateWork({
        id: quest.id,
        updates: { topic },
        type: quest.type as WorkType,
      });
    }
  };

  const handleSubtopicChange = async ({
    subtopics,
  }: {
    subtopics: OptionType[];
  }) => {
    setAttributeErrors({ subtopic: { error: false } });
    const strings = subtopics.map((val) => val.value);
    if (rep) {
      await rep.mutate.updateWork({
        id: quest.id,
        updates: { subtopic: strings },
        type: quest.type as WorkType,
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
        type: quest.type as WorkType,
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
        type: quest.type as WorkType,
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
          type: quest.type as WorkType,
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
