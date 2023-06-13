import { CalendarIcon } from "lucide-react";
import { format } from "path";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

import TextareaAutosize from "react-textarea-autosize";
import { Topics, TopicsType } from "~/types/types";
import { Badge } from "~/ui/Badge";
import { Button } from "~/ui/Button";

import { Calendar } from "~/ui/Calendar";
import { Input } from "~/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "~/ui/Popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/Select";
import { cn } from "~/utils/cn";
export const Title = ({
  title,
  placeholder,
  handleTitleChange,
}: {
  title: string | undefined;
  placeholder: string;
  handleTitleChange: (e: FormEvent<HTMLTextAreaElement>) => void;
}) => {
  const titlePlaceholderText = "Write title here";
  const titleRef = useRef<HTMLDivElement>(null);

  // const handleTitleFocus = () => {
  //   if (titleRef.current?.firstChild?.nodeType === 1) {
  //     titleRef.current.firstChild.remove();
  //     const r = document.createRange();

  //     r.setStart(titleRef.current, 0);
  //     r.setEnd(titleRef.current, 0);
  //     document.getSelection()?.removeAllRanges();
  //     document.getSelection()?.addRange(r);
  //   }
  // };

  // const handleTitleBlur = () => {
  //   if (titleRef.current?.textContent === "") {
  //     const placeholder = document.createElement("div");
  //     placeholder.textContent = titlePlaceholderText;
  //     placeholder.className = styles.titlePlaceholder!;
  //     titleRef.current.appendChild(placeholder);
  //   }
  // };
  return (
    <div className="prose prose-stone dark:prose-invert mx-auto w-[800px]">
      <TextareaAutosize
        autoFocus
        id="title"
        defaultValue={title}
        placeholder={placeholder}
        onInput={handleTitleChange}
        className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
        // {...register("title")}
      />
    </div>
    // <div
    //   id="title"
    //   contentEditable
    //   ref={titleRef}
    //   className={styles.titleContainer}
    //   onFocus={handleTitleFocus}
    //   onBlur={handleTitleBlur}
    //   suppressContentEditableWarning={true}
    //   onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
    //     if (e.key === "Backspace") {
    //       const title = document.getElementById("title");
    //       if (
    //         !title?.childNodes[0] ||
    //         title?.childNodes[0].textContent === ""
    //       ) {
    //         e.preventDefault();
    //       }
    //     }
    //   }}
    //   onInput={handleTitleChange}
    // >
    //   {title || (
    //     <div className={styles.titlePlaceholder}>{titlePlaceholderText}</div>
    //   )}
    // </div>
  );
};
export const TopicSelect = ({
  handleTopicChange,
  topic,
}: {
  topic?: TopicsType;
  handleTopicChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}) => {
  const [topicState, setTopicState] = useState<TopicsType | undefined>(
    undefined
  );
  useEffect(() => {
    setTopicState(topic);
  }, [topic]);
  return (
    // <Select
    //   size="sm"
    //   placeholder="Select topic"
    //   bg={
    //     topic?.toUpperCase() === "BUSINESS"
    //       ? "green.100"
    //       : topic === "PROGRAMMING"
    //       ? "purple.100"
    //       : topic === "MARKETING"
    //       ? "red.100"
    //       : topic === "VIDEOGRAPHY"
    //       ? "blue.100"
    //       : "none"
    //   }
    //   w="40"
    //   onChange={(e) => {
    //     handleTopicChange(e), setTopicState(e.target.value as TopicsType);
    //   }}
    //   value={topicState || ""}
    // >
    //   <option value="BUSINESS">Business</option>
    //   <option value="PROGRAMMING">Programming</option>
    //   <option value="MARKETING">Marketing</option>
    // </Select>
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {Topics.map((t, i) => (
          <SelectItem value={t} key={i}>
            {t}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const Subtopic = ({
  subtopic,
  handleSubtopicChange,
}: {
  subtopic: string[] | undefined;
  handleSubtopicChange: () => void;
}) => {
  const subtopicRef = useRef<HTMLDivElement>(null);

  const subtopicPlaceholderText = "Write subtopics and type , for styling";

  const handleSubtopicFocus = () => {
    if (
      subtopicRef.current?.childElementCount === 1 &&
      subtopicRef.current?.firstChild?.nodeType === 1 &&
      subtopicRef.current.firstChild.textContent === subtopicPlaceholderText
    ) {
      subtopicRef.current.firstChild.remove();
      const r = document.createRange();

      r.setStart(subtopicRef.current, 0);
      r.setEnd(subtopicRef.current, 0);
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(r);
    }
  };
  const handleSubtopicBlur = () => {
    if (
      subtopicRef.current?.childElementCount === 0 &&
      subtopicRef.current?.textContent === ""
    ) {
      const placeholder = document.createElement("div");
      placeholder.textContent = subtopicPlaceholderText;
      // placeholder.className = styles.subtopicPlaceholder!;
      subtopicRef.current.appendChild(placeholder);
    }
  };
  return (
    <div
      id="subtopic"
      contentEditable
      ref={subtopicRef}
      suppressContentEditableWarning={true}
      onFocus={handleSubtopicFocus}
      onBlur={handleSubtopicBlur}
      onInput={(e) => {
        const content = document.getElementById("subtopic");
        const text =
          content?.childNodes[content.childNodes.length - 1]?.textContent;

        if (text && text.includes(",")) {
          const subtopic = text.split(",");
          content.removeChild(content.lastChild!);
          const div = document.createElement("div");
          const div2 = document.createElement("div");

          div2.innerHTML = "";
          // div.className = styles.subtopicBadge!;
          // div2.className = styles.subtopicBadge!;
          div.textContent = subtopic[0]!;
          content.appendChild(div);
          content.appendChild(div2);

          const r = document.createRange();
          r.setStart(div2, 0);
          r.setEnd(div2, 0);
          document.getSelection()?.removeAllRanges();
          document.getSelection()?.addRange(r);
        }
        handleSubtopicChange();
      }}
    >
      {subtopic ? (
        subtopic.map((s, i) => (
          <Badge className="bg-blue-400" key={i}>
            {s}
          </Badge>
        ))
      ) : (
        <div>{subtopicPlaceholderText}</div>
      )}
    </div>
  );
};
export const Reward = ({
  reward,
  handleRewardChange,
}: {
  reward: number | undefined;
  handleRewardChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [stateReward, setStateReward] = useState(0);
  useEffect(() => {
    if (reward) {
      setStateReward(reward);
    }
  }, [reward]);
  return (
    <div className="flex gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
      >
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          d="M4.873 3h14.254a1 1 0 0 1 .809.412l3.823 5.256a.5.5 0 0 1-.037.633L12.367 21.602a.5.5 0 0 1-.706.028c-.007-.006-3.8-4.115-11.383-12.329a.5.5 0 0 1-.037-.633l3.823-5.256A1 1 0 0 1 4.873 3zm.51 2l-2.8 3.85L12 19.05 21.417 8.85 18.617 5H5.383z"
          fill="var(--purple)"
        />
      </svg>
      <Input
        className="w-40 p-2 "
        placeholder="Enter amount"
        value={stateReward || ""}
        type="number"
        onChange={(e) => {
          if (e.target.valueAsNumber > 0 || !e.target.value) {
            handleRewardChange(e), setStateReward(e.target.valueAsNumber || 0);
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
  handleSlotsChange: (e: ChangeEvent<HTMLInputElement>) => void;
  slots: number | undefined;
}) => {
  const [stateSlots, setStateSlots] = useState(0);
  useEffect(() => {
    if (slots) {
      setStateSlots(slots);
    }
  }, [slots]);
  return (
    <div className="flex gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
      >
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          d="M2 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm8.284 3.703A8.002 8.002 0 0 1 23 22h-2a6.001 6.001 0 0 0-3.537-5.473l.82-1.824zm-.688-11.29A5.5 5.5 0 0 1 21 8.5a5.499 5.499 0 0 1-5 5.478v-2.013a3.5 3.5 0 0 0 1.041-6.609l.555-1.943z"
          fill="var(--gray)"
        />
      </svg>
      <Input
        className="w-40 p-2 "
        placeholder="Enter amount"
        value={stateSlots || ""}
        type="number"
        onChange={(e) => {
          if (e.target.valueAsNumber > 0 || !e.target.value) {
            handleSlotsChange(e), setStateSlots(e.target.valueAsNumber || 0);
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
  handleDateChange: (e: Date | undefined) => void;

  date: string | undefined;
}) => {
  const [dateState, setDateState] = useState<Date>();
  useEffect(() => {
    if (date) {
      const newDate = new Date(date);
      setDateState(newDate);
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
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? "shiity date" : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateState}
            onSelect={(e) => {
              setDateState(e), handleDateChange(e);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
