import { useAuth } from "@clerk/nextjs";
import { Heading, MinusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Channel, ChannelType, Message, Topic, Topics } from "~/types/types";
import { Button } from "~/ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "~/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/Select";
import { MessageInput } from "./MessageInput";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/Avatar";
import PartySocket from "partysocket";
import { GlobalStore } from "~/zustand/global";
import { ReplicacheInstancesStore } from "~/zustand/rep";

export default function GlobalChat({
  setShowChat,
}: {
  setShowChat: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);

  const [newMessage, setNewMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const rep = ReplicacheInstancesStore((state) => state.globalChatRep);
  const channel = GlobalStore((state) => state.channel);
  const setChannel = GlobalStore((state) => state.setChannel);
  const { getToken, isSignedIn, userId, isLoaded } = useAuth();
  const socketRef = useRef<PartySocket | undefined>(undefined);
  const socket = socketRef.current;
  const handleChannelChange = useCallback(
    async (value: ChannelType) => {
      if (rep) await rep.mutate.updateChannel(value);
      setChannel(value);
    },
    [rep, setChannel]
  );

  const addMessage = useCallback(
    async (message: Message) => {
      if (rep) {
        const buffer = Buffer.from(JSON.stringify(message));
        const byteOffset = 0;
        const byteLength = buffer.byteLength;
        await rep.mutate.createMessage(message);
        if (socket) {
          socket.send({ buffer, byteLength, byteOffset });
        }
      }
    },
    [rep, socket]
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    socketRef.current = new PartySocket({
      host: "localhost:1999", // for local development
      // host: "my-party.username.partykit.dev", // for production
      room: channel,
    });
    socketRef.current.addEventListener("message", (message) => {
      console.log("message from server", message); // "hello from room: my-room"
    });
    return () => {
      if (socketRef.current)
        socketRef.current.removeEventListener("message", (e) => {
          console.log("remove");
        });
    };
  }, [channel]);

  useEffect(() => {
    if (messagesEndRef && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        block: "end",
      });
    }
  }, [messages]);
  return (
    <Card className="fixed bottom-2 right-[50px] z-40 w-full  border-[1px] border-slate-200 shadow-lg dark:border-slate-6 sm:w-[500px]">
      <CardHeader className="flex h-16 flex-row justify-between border-b-[1px] border-slate-200 p-3 dark:border-slate-6 dark:bg-slate-3">
        <Select
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onValueChange={handleChannelChange}
          value={channel}
        >
          <SelectTrigger className="w-[180px]  dark:border-[1px] dark:border-slate-6 dark:bg-slate-3 ">
            <SelectValue placeholder="Select channel" />
          </SelectTrigger>
          <SelectContent>
            {Channel.map((t, i) => (
              <SelectItem value={t} key={i}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="icon"
          className="mt-0 bg-blue-4 hover:bg-blue-5"
          onClick={() => setShowChat(false)}
        >
          <MinusIcon className="text-blue-9" />
        </Button>
      </CardHeader>
      <CardContent className="h-[300px] overflow-y-auto bg-slate-10 py-0 pb-2 dark:bg-slate-2">
        <div className="flex w-full flex-col">
          {messages.map((m) => (
            <UserMessage
              userId={m.userId}
              key={m.id}
              username={m.username}
              message={m.message}
              profile={m.profile}
              level={m.level}
            />
          ))}
        </div>

        <div ref={messagesEndRef}></div>
      </CardContent>
      <CardFooter className="flex h-12 items-center justify-center rounded-md border-t-[1px] border-slate-200 p-4 dark:border-slate-6 dark:bg-slate-3">
        {/* <MessageInput
          isSignedIn={!!isSignedIn}
          onSubmit={async (text: string) => null}
        /> */}
      </CardFooter>
    </Card>
  );
}
const UserMessage = ({
  userId,
  username,
  profile,
  message,
  level,
}: {
  userId: string;
  username: string;
  profile: string | undefined;
  message: string;
  level: number;
}) => {
  return (
    <Card className="flex h-fit w-full flex-row items-center p-1">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      <div className="flex flex-col pl-2">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold">
          {username}
        </p>
        <p className="font-sm">{message}</p>
      </div>
    </Card>
  );
};
