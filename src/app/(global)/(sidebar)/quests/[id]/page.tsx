import QuestPage from "../QuestPage";

const date = new Date().toISOString();
const quest = {
  id: "quest1",
  creatorId: "user1",
  deadline: date,
  lastUpdated: date,
  published: true,
  publishedAt: date,
  publisherUsername: "pachimari",
  reward: 10,
  slots: 10,
  solverCount: 0,
  status: "OPEN" as const,
  subtopic: ["LOGO"],
  textContent: "Hello world",
  title: "Hello world",
  topic: "BUSINESS" as const,
  type: "QUEST" as const,
  version: 1,
  collaborators: [],
};

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  console.log("hello", id);

  const emptySlots: Record<string, any>[] = [];
  for (let i = 0; i < quest.slots - quest.solverCount; i++) {
    emptySlots.push({});
  }
  return <QuestPage id={id} />;
}
