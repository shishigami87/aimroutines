"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusIcon } from "@radix-ui/react-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Game } from "@prisma/client";

import { api } from "@/trpc/react";
import { capitalize } from "@/lib/utils";
import { createRoutineSchema } from "@/shared/schemas/routine";
import { Textarea } from "@/components/ui/textarea";

export function CreateRoutineForm() {
  const utils = api.useUtils();

  const { toast } = useToast();

  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof createRoutineSchema>>({
    resolver: zodResolver(createRoutineSchema),
    defaultValues: {
      title: "",
      description: "",
      author: "",
      authorHandle: "",
      game: Game.KOVAAKS,
      reference: "",
      externalResource: "",
    },
  });

  const createRoutine = api.routine.create.useMutation({
    onSuccess: async (data) => {
      await utils.routine.invalidate();
      setSubmitDialogOpen(false);
    },
  });

  return (
    <>
      <div className="fixed bottom-24 right-4">
        <Button
          variant="outline"
          className="font-bold text-primary"
          onClick={() => setSubmitDialogOpen(true)}
        >
          <PlusIcon />
          Submit new routine
        </Button>
      </div>
      <Sheet open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <SheetContent onInteractOutside={(event) => event.preventDefault()}>
          <SheetHeader className="mb-4">
            <SheetTitle>Submit new routine</SheetTitle>
            <SheetDescription>
              This will submit a new routine that others can see and vote on.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                createRoutine.mutate(data);
                toast({
                  title: "All done!",
                  description: "The routine has been submitted.",
                });
                form.reset();
              })}
              className="space-y-2"
            >
              <FormField
                control={form.control}
                name="game"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose game" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(Game).map((game) => (
                          <SelectItem key={game} value={game}>
                            {capitalize(game)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The game for which this routine was created
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
                    </FormControl>
                    <FormDescription>The title of this routine</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Additional information about this routine
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter author" {...field} />
                    </FormControl>
                    <FormDescription>
                      The original author of this routine
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="authorHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author Twitter</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter author's twitter handle"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The twitter handle of the original author of this routine
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          form.getValues().game === Game.KOVAAKS
                            ? "Enter share code"
                            : "Enter routine URL"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {form.getValues().game === Game.KOVAAKS
                        ? "The share code to add this routine in Kovaaks"
                        : "The URL to open this routine in Aimlabs"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="externalResource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External resource</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      Any external resources the routine may have
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SheetFooter className="mt-4">
                <SheetClose asChild>
                  <Button type="submit" disabled={createRoutine.isPending}>
                    {createRoutine.isPending ? "Submitting..." : "Submit"}
                  </Button>
                </SheetClose>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
}
