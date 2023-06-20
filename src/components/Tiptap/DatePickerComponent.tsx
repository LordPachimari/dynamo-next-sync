import { NodeViewWrapper } from "@tiptap/react";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { WorkspaceStore } from "~/zustand/workspace";
import debounce from "lodash.debounce";
import {
  SubtopicSuggestion,
  SubtopicsType,
  Topics,
  TopicsType,
} from "~/types/types";

import { format } from "date-fns";
import { Gem, Users2 } from "lucide-react";
import { Input } from "~/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "~/ui/Popover";
import { Button } from "~/ui/Button";
import { cn } from "~/utils/cn";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "~/ui/Calendar";

type Node = {
  attrs: {
    deadline: string;
    id: string;
  };
};

export default function DatePickerComponent(props: {
  [key: string]: any;
  as?: React.ElementType;
  node: Node;

  updateAttributes: (props: { deadline: string | "inherit" }) => void;
}) {
  const rep = WorkspaceStore((state) => state.rep);
  const [dateState, setDateState] = useState<Date>();
  useEffect(() => {
    if (props.node.attrs.deadline) {
      const newDate = new Date(props.node.attrs.deadline);
      setDateState(newDate);
    } else {
      setDateState(undefined);
    }
  }, [props.node.attrs.deadline]);

  const handleDateChange = async (date: Date | undefined) => {
    if (date) {
      props.updateAttributes({ deadline: date.toISOString() });
      if (rep && props.node.attrs.id) {
        await rep.mutate.updateWork({
          id: props.node.attrs.id,
          updates: { deadline: date.toISOString() },
        });
      }
    }
  };

  return (
    <NodeViewWrapper className="w-full">
      <div className="centerDivVertically mb-2">
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
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSelect={async (val) => {
                setDateState(val), await handleDateChange(val);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </NodeViewWrapper>
  );
}
