import { SendIcon } from "lucide-react";
import Link from "next/link";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/ui/Button";
import { Input } from "~/ui/Input";
export const MessageInput = ({
  onSubmit,
  isSignedIn,
}: {
  onSubmit: (text: string) => Promise<null | undefined>;
  isSignedIn: boolean;
}) => {
  const [messageText, setMessageText] = useState("");
  const submitOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    // Watch for enter key
    if (event.key === "Enter" && isSignedIn && messageText.trim()) {
      onSubmit(messageText).catch((err) => console.log(err));
      setMessageText("");
    }
    if (event.key === "Enter") {
      if (!isSignedIn) {
        toast("please sign in to send a message");
      }
    }
  };
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <>
      <Input
        className="w-full bg-slate-11"
        ref={inputRef}
        placeholder="Send a message..."
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={submitOnEnter}
        value={messageText}
      />
      <Button
        size="icon"
        className="ml-3 bg-blue-9 hover:bg-blue-10 "
        disabled={!isSignedIn}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={() => {
          if (isSignedIn) {
            onSubmit(messageText)
              .catch((err) => console.log(err))
              .finally(() => setMessageText(""));
          } else {
            toast("Please sign");
          }
        }}
      >
        <SendIcon className="text-white" />
      </Button>
    </>
  );
};
