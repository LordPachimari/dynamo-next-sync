/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/ui/form";
import { Input } from "~/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/Select";
import { Textarea } from "~/ui/Textarea";
import { cn } from "~/utils/cn";
import { Button } from "~/ui/Button";
import { Label } from "~/ui/label";
import { Twitter } from "lucide-react";
import { ReplicacheInstancesStore } from "~/zustand/rep";
import { userKey } from "~/repl/client/mutators/user";
import { useAuth } from "@clerk/nextjs";
import { useSubscribe } from "replicache-react";
import { User } from "~/types/types";

const profileFormSchema = z.object({
  username: z.optional(
    z
      .string()
      .min(2, {
        message: "Username must be at least 2 characters.",
      })
      .max(30, {
        message: "Username must not be longer than 30 characters.",
      })
  ),

  about: z.string().max(160).min(4),
  links: z
    .array(
      z.object({
        value: z.string().url({ message: "Please enter a valid URL." }),
      })
    )
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This can come from your database or API.

export function ProfileForm() {
  const rep = ReplicacheInstancesStore((state) => state.globalRep);
  const { userId } = useAuth();
  const user = useSubscribe(
    rep,
    async (tx) => {
      if (userId) {
        const user = (await tx.get(userKey(userId))) as User | null;

        if (user) {
          return user;
        }
      }
      return null;
    },
    null,
    []
  );
  const defaultValues: Partial<ProfileFormValues> = {
    about: user && user.about ? user.about : "",
    links: [],
  };
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append } = useFieldArray({
    name: "links",
    control: form.control,
  });

  async function onSubmit(data: ProfileFormValues) {
    console.log("data", data);
    if (userId && rep && user) {
      if (data.about !== user.about)
        await rep.mutate.updateUser({
          ...(data.username && { username: data.username }),
          ...(data.about && { about: data.about }),
          ...(data.links && data.links?.length > 0 && { links: data.links }),
          userId,
        });

      toast.success("Successfully updated the profile!");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  disabled
                  placeholder={user ? user.username : ""}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym. You can only change this once every 30 days.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    user && user.about
                      ? user.about
                      : "Tell us a little bit about yourself"
                  }
                  className="resize-none"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`links.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && "sr-only")}>
                    URLs
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && "sr-only")}>
                    Add links to your website, blog, or social media profiles.
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ value: "" })}
          >
            Add URL
          </Button>
        </div>
        <Button type="submit" className="bg-blue-9 text-white hover:bg-blue-10">
          Update profile
        </Button>
      </form>
    </Form>
  );
}
