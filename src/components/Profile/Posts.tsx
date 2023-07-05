import { Card, CardContent, CardHeader } from "~/ui/Card";

export default function UserPosts() {
  return (
    <Card className="h-[600px] w-full rounded-xl p-4 drop-shadow-sm">
      <CardHeader className="h-[70px]"></CardHeader>
      <CardContent className="h-[500px]  rounded-xl bg-slate-50 shadow-inner"></CardContent>
    </Card>
  );
}
