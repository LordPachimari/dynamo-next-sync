"use client";
import { z } from "zod";
import { Card, CardHeader } from "~/ui/Card";
const UsernameFormValues = z.object({
  username: z.string().min(2, { message: "username is too short" }),
});
type UsernameFormValuesType = z.infer<typeof UsernameFormValues>;
export default function CreateUser() {
  return (
    <div className="h-screen w-screen">
      <Card>
        <CardHeader>
          <h3>Enter username</h3>
        </CardHeader>
      </Card>
    </div>
  );
}
