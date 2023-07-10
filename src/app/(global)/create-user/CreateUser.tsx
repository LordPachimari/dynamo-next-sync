/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/ui/Button";
import { Card, CardFooter, CardHeader } from "~/ui/Card";
import { Input } from "~/ui/Input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/ui/form";
import { ReplicacheInstancesStore } from "~/zustand/rep";
const UsernameFormValues = z.object({
  username: z.string().min(2, { message: "username is too short" }),
});
type UsernameFormValuesType = z.infer<typeof UsernameFormValues>;
export default function CreateUser() {
  const rep = ReplicacheInstancesStore((state) => state.globalRep);
  const { userId } = useAuth();
  const form = useForm<UsernameFormValuesType>({
    resolver: zodResolver(UsernameFormValues),
    defaultValues: { username: "" },
    mode: "onChange",
  });
  const router = useRouter();
  if (!userId) {
    return <div>Sign up to create an account</div>;
  }
  async function onSubmit(data: UsernameFormValuesType) {
    console.log("data", data);
    if (rep && userId) {
      await rep.mutate.createUser({ username: data.username, userId });
      router.push("/quests");
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="h-fit w-full rounded-xl bg-white drop-shadow-md dark:border-[1px] dark:border-slate-6 dark:bg-slate-3 md:w-96">
        <CardHeader>
          <h3>Enter username</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder={"Username"} {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-center">
                <Button type="submit" className="bg-blue-9 text-white">
                  Next
                </Button>
              </div>
            </form>
          </Form>
        </CardHeader>
      </Card>
    </div>
  );
}
