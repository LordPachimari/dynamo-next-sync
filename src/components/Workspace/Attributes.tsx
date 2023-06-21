/* eslint-disable @typescript-eslint/no-misused-promises */
import { CalendarIcon, Gem, Users2 } from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { format } from "date-fns";
import TextareaAutosize from "react-textarea-autosize";
import { SubtopicSuggestion, Topics, TopicsType } from "~/types/types";
import { Badge } from "~/ui/Badge";
import { Button } from "~/ui/Button";
import { Calendar } from "~/ui/Calendar";
import { Input } from "~/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "~/ui/Popover";
import {
  Select as MySelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/Select";
import Select, { MultiValue, StylesConfig } from "react-select";
import makeAnimated from "react-select/animated";
import { cn } from "~/utils/cn";
import SingleValue from "react-select/dist/declarations/src/components/SingleValue";
import { produce } from "immer";
import { AttributeError } from "~/zustand/workspace";
export const Title = ({
  title,
  placeholder,
  handleTitleChange,
  error,
}: {
  title: string | undefined;
  placeholder: string;
  handleTitleChange: (
    e: FormEvent<HTMLTextAreaElement>
  ) => Promise<void> | undefined;
  error: AttributeError;
}) => {
  const [titleState, setTitleState] = useState("");
  useEffect(() => {
    setTitleState(title || "");
  }, [title]);
  return (
    <div className="prose prose-stone dark:prose-invert mx-auto w-[800px]">
      <TextareaAutosize
        autoFocus
        id="title"
        defaultValue={titleState}
        placeholder={placeholder}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onInput={handleTitleChange}
        className="w-full resize-none appearance-none overflow-hidden bg-transparent text-4xl font-bold focus:outline-none"
        // {...register("title")}
      />
    </div>
  );
};
export const TopicSelect = ({
  handleTopicChange,
  topic,
}: {
  topic?: TopicsType;
  handleTopicChange: (topic: TopicsType) => Promise<void>;
}) => {
  const [topicState, setTopicState] = useState<TopicsType | undefined>(
    undefined
  );
  useEffect(() => {
    setTopicState(topic);
  }, [topic]);
  return (
    <MySelect
      onValueChange={async (value) => {
        await handleTopicChange(value as TopicsType);
        setTopicState(value as TopicsType);
      }}
      value={topicState}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select topic" />
      </SelectTrigger>
      <SelectContent>
        {Topics.map((t, i) => (
          <SelectItem value={t} key={i}>
            {t}
          </SelectItem>
        ))}
      </SelectContent>
    </MySelect>
  );
};

interface BadgeProps {
  text: string;
  id: number;
  removeBadge: (id: number) => void;
}

const CustomBadge: React.FC<BadgeProps> = ({ text, id, removeBadge }) => (
  <span
    onClick={() => removeBadge(id)}
    className="mr-2 inline-block w-10 cursor-pointer rounded-full bg-blue-500 px-3 py-1 text-sm font-semibold text-white"
  >
    {text}
  </span>
);

const animatedComponents = makeAnimated();
export interface OptionType {
  value: string;
  label: string;
}

const customStyles: StylesConfig<OptionType, false> = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "orange" : base.borderColor,
    boxShadow: state.isFocused ? "0 0 0 0.2px orange" : base.boxShadow,
    "&:hover": {
      borderColor: state.isFocused ? "orange" : base.borderColor,
    },
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isFocused ? "whitesmoke" : "",
      color: "black",
    };
  },
};
export const Subtopic = ({
  subtopic,
  handleSubtopicChange,
}: {
  subtopic: string[] | undefined;
  handleSubtopicChange: ({
    subtopics,
  }: {
    subtopics: MultiValue<OptionType>;
  }) => Promise<void>;
}) => {
  const [subtopicState, setSubtopicState] = useState<MultiValue<OptionType>>();
  useEffect(() => {
    const multiVal = subtopic
      ? subtopic.map((v) => ({ value: v, label: v }))
      : [];
    setSubtopicState(multiVal as MultiValue<OptionType>);
  }, [subtopic]);
  const options = SubtopicSuggestion.map((topic) => ({
    value: topic,
    label: topic.toLocaleLowerCase(),
  }));

  return (
    <div>
      {" "}
      <Select
        options={options}
        components={animatedComponents}
        isMulti
        value={subtopicState}
        placeholder="Select subtopic"
        closeMenuOnSelect={false}
        styles={customStyles}
        classNames={{
          control: (state) => (state.isFocused ? "#f97316" : "border-grey-300"),
        }}
        onChange={async (val) => {
          await handleSubtopicChange({
            subtopics: val as MultiValue<OptionType>,
          }),
            setSubtopicState((old) => val as MultiValue<OptionType>);
        }}
      />
    </div>
  );
};
export const Reward = ({
  reward,
  handleRewardChange,
}: {
  reward: number | undefined;
  handleRewardChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
}) => {
  const [stateReward, setStateReward] = useState<number | "">("");
  useEffect(() => {
    setStateReward(reward || 0);
  }, [reward]);
  return (
    <div className="flex items-center gap-2  ">
      <Gem className="text-purple-500" />
      <Input
        className="w-40 p-2 "
        placeholder="Enter amount"
        value={stateReward}
        type="number"
        onChange={async (e) => {
          const inputValue = e.target.value;
          if (inputValue === "" || Number(inputValue) > 0) {
            setStateReward(inputValue === "" ? "" : Number(inputValue));
            await handleRewardChange(e);
          }
        }}
        min={1}
      />
    </div>
  );
};
export const Slots = ({
  handleSlotsChange,
  slots,
}: {
  handleSlotsChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  slots: number | undefined;
}) => {
  const [stateSlots, setStateSlots] = useState<number | "">("");
  useEffect(() => {
    setStateSlots(slots || 0);
  }, [slots]);
  return (
    <div className="flex items-center gap-2">
      <Users2 className="text-gray-500" />
      <Input
        className="w-40 p-2 "
        placeholder="Enter amount"
        value={stateSlots}
        type="number"
        onChange={async (e) => {
          const inputValue = e.target.value;
          if (inputValue === "" || Number(inputValue) > 0) {
            setStateSlots(inputValue === "" ? "" : Number(inputValue));
            await handleSlotsChange(e);
          }
        }}
        min={1}
      />
    </div>
  );
};
export const DatePicker = ({
  date,

  handleDateChange,
}: {
  handleDateChange: (e: Date | undefined) => Promise<void>;

  date: string | undefined;
}) => {
  const [dateState, setDateState] = useState<Date>();
  useEffect(() => {
    if (date) {
      const newDate = new Date(date);
      setDateState(newDate);
    } else {
      setDateState(undefined);
    }
  }, [date]);

  return (
    <div className="centerDivVertically">
      <p className="font-semibold">Deadline</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !dateState && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateState ? format(dateState, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateState}
            onSelect={async (val) => {
              setDateState(val), await handleDateChange(val);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
