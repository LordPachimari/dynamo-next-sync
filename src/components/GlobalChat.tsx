export default function GlobalChat({
  setShowChat,
}: {
  setShowChat: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);

  const [newMessage, setNewMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [channel, setChannel] = useState<TopicsType | "GENERAL">("GENERAL");
  const { getToken, isSignedIn, userId, isLoaded } = useAuth();
  const user = trpc.user.userComponent.useQuery(
    { id: userId || "" },
    { enabled: !!userId && isSignedIn && isLoaded, staleTime: 10 * 60 * 1000 }
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = async ({
    message,
    channel,
    username,
    profile,
    user_id,
  }: {
    message: string;
    channel: string;
    username: string;
    profile?: string;
    user_id?: string;
  }) => {
    try {
      const supabaseAccessToken = await getToken({ template: "supabase" });
      if (supabaseAccessToken && message) {
        const supabase = supabaseClient({ supabaseAccessToken });
        const { data } = await supabase
          .from(TABLE_GLOBAL_CHAT)
          .insert([{ message, channel, user_id, username, profile }]);

        // .select();
        return data;
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const deleteMessage = async ({ messageId }: { messageId: string }) => {
    try {
      const supabaseAccessToken = await getToken({ template: "supabase" });
      if (supabaseAccessToken) {
        const supabase = supabaseClient({ supabaseAccessToken });
        const { data } = await supabase
          .from(TABLE_GLOBAL_CHAT)
          .delete()
          .match({ id: messageId });
        return data;
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    async function DoTheThing() {
      const supabaseAccessToken = await getToken({ template: "supabase" });
      if (supabaseAccessToken) {
        const supabase = supabaseClient({ supabaseAccessToken });
        const supabaseChannel = supabase
          .channel("public:messages")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: TABLE_GLOBAL_CHAT,
            },
            // (payload) => setNewMessage(payload.new as Message)
            (payload) => {
              const newMessage = payload.new as Message;
              console.log("new message coming!", messages);
              // setMessages();
              setNewMessage(newMessage);
            }
          )
          // .on(
          //   "postgres_changes",
          //   {
          //     event: "DELETE",
          //     schema: "public",
          //     table: TABLE_GLOBAL_CHAT,
          //   },
          //   // (payload) => setDeletedMessage(payload.old as Message)
          //   (payload) => {
          //     const deletedMessage = payload.old as Message;
          //     if (channel === deletedMessage.channel) {
          //       const newMessages = messages.filter(
          //         (message) => message.id !== deletedMessage.id
          //       );
          //       setMessages(newMessages);
          //     }
          //   }
          // )

          .subscribe();
        return () => {
          supabase
            .removeChannel(supabaseChannel)
            .catch((err) => console.log(err));
        };
      }
    }
    DoTheThing().catch((err) => console.log("error realtime"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const fetchMessages = async () => {
      const supabaseAccessToken = await getToken({ template: "supabase" });

      const supabase = supabaseClient({ supabaseAccessToken });

      try {
        setIsLoading(true);

        const { data } = await supabase
          .from(TABLE_GLOBAL_CHAT)
          .select(`*`)
          .eq("channel", channel)
          .order("created_at", { ascending: true });

        if (data) {
          setMessages(data as Message[]);

          return data;
        }
      } catch (error) {
        console.log("error", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages().catch((err) => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);
  // // New message received from Postgres
  useEffect(() => {
    if (newMessage && newMessage.channel === channel) {
      setMessages([...messages, newMessage]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

  // // New message received from Postgres
  // useEffect(() => {
  //   if (newMessage && newMessage.channel === channel) {
  //     setMessages([...messages, newMessage]);
  //   }
  // }, [channel, newMessage, messages]);
  // // Deleted message received from postgres
  // useEffect(() => {
  //   if (deletedMessage)
  //     setMessages(
  //       messages.filter((message) => message.id !== deletedMessage.id)
  //     );
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [deletedMessage]);

  useEffect(() => {
    if (messagesEndRef && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        block: "end",
      });
    }
  }, [messages]);
  return (
    <Card
      // w="80"
      borderWidth="2px"
      borderColor="blue.300"
      boxShadow="none"
      borderRadius="2xl"
      position="fixed"
      bottom="2"
      right={{ base: "5", lg: "10" }}
      zIndex={6}
      h="lg"
      w={{ base: "90vw", lg: "80" }}
    >
      <CardHeader
        display="flex"
        bg="white"
        h="12"
        pt="3"
        borderTopRadius="xl"
        position="relative"
        borderBottomWidth="2px"
        borderColor="blue.100"
        alignItems="center"
        pb="3"
      >
        <Heading as="h3" fontSize="lg">
          CHAT
        </Heading>
        <Select
          ml={5}
          size="sm"
          w="40"
          value={channel}
          onChange={(e) => setChannel(e.target.value as TopicsType | "GENERAL")}
        >
          <option value="GENERAL">GENERAL</option>
          {Topics.map((t) => (
            <option key={t} value={t.toUpperCase()}>
              {t}
            </option>
          ))}
        </Select>
        <IconButton
          position="absolute"
          right="2"
          aria-label="close chat"
          size="sm"
          bg="blue.50"
          _hover={{ bg: "blue.100" }}
          onClick={() => setShowChat(false)}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path d="M5 11V13H19V11H5Z" fill="var(--blue)"></path>
            </svg>
          }
        />
      </CardHeader>
      <CardBody
        py="0"
        pb={2}
        px="2"
        overflowY="auto"
        bg="blue.100"
        css={{
          // Add css to style the scrollbar
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "gray.400",
            borderRadius: "20px",
          },
        }}
      >
        {isLoading ? (
          <Center w="100%" h="100%">
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </Center>
        ) : (
          <Flex flexDir="column" w="100%">
            {messages.map((m) => (
              <UserMessage
                userId={m.user_id}
                key={m.id}
                username={m.username}
                message={m.message}
                profile={m.profile}
              />
            ))}
          </Flex>
        )}

        <Box h={2} ref={messagesEndRef}></Box>
      </CardBody>
      <CardFooter
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="white"
        h="12"
        borderRadius="xl"
        p="4"
      >
        <MessageInput
          isSignedIn={!!isSignedIn}
          onSubmit={async (text: string) =>
            addMessage({
              channel,
              message: text,
              ...(user.data &&
                user.data.profile && {
                  profile: user.data.profile,
                }),
              username: user.data ? user.data.username : "unknown",
              ...(userId && { user_id: userId }),
            })
          }
        />
      </CardFooter>
    </Card>
  );
}
const UserMessage = ({
  userId,
  username,
  profile,
  message,
}: {
  userId: string;
  username: string;
  profile?: string;
  message: string;
}) => {
  let userImage: StaticImageData | undefined = undefined;
  if (profile) {
    userImage = JSON.parse(profile) as StaticImageData;
  }
  return (
    <Card
      mt="2"
      w="100%"
      h="fit-content"
      display="flex"
      flexDir="row"
      alignItems="center"
      p="1"
    >
      {userImage ? (
        <Link href={`/profile/${username}`}>
          <div className="circular-image-container">
            <Image
              src={userImage}
              alt="avatar"
              className="circular-image"
              width={50}
            />
          </div>
        </Link>
      ) : (
        <Avatar name={username} size="sm" />
      )}
      <Flex flexDir="column" pl={2}>
        <Text
          fontSize="sm"
          fontWeight="bold"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {username}
        </Text>
        <Text fontSize="sm">{message}</Text>
      </Flex>
    </Card>
  );
};
export const LoadingChat = () => {
  return (
    <Card
      w="90%"
      bg="none"
      borderWidth="3px"
      borderColor="gray.300"
      boxShadow="none"
      borderRadius="2xl"
    >
      <CardHeader display="flex" bg="white" h="12" pt="3" borderTopRadius="xl">
        <Heading as="h3" fontSize="lg">
          CHAT
        </Heading>
      </CardHeader>
      <CardBody
        py="0"
        pb={2}
        px="2"
        h="sm"
        minH="sm"
        maxH="sm"
        overflowY="auto"
        bg="blue.50"
        css={{
          // Add css to style the scrollbar
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "gray.400",
            borderRadius: "20px",
          },
        }}
      >
        <Center w="100%" h="100%">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Center>
      </CardBody>
      <CardFooter
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="white"
        h="12"
        borderRadius="xl"
        p="4"
      ></CardFooter>
    </Card>
  );
};
