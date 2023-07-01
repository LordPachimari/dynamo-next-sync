import Editor from "~/components/Workspace/Editor";
export default function MainPage({ params }: { params: { id: string } }) {
  return <Editor id={params.id} />;
}
