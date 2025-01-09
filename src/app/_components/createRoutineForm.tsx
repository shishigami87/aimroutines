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
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Game } from "@prisma/client";

import { api } from "@/trpc/react";
import { capitalize } from "@/lib/utils";
import { createRoutineSchema } from "@/shared/schemas/routine";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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
      playlists: [],
      externalResource: "",
      isBenchmark: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "playlists",
    control: form.control,
  });

  const createRoutine = api.routine.create.useMutation({
    onSuccess: async (data) => {
      await utils.routine.invalidate();
      setSubmitDialogOpen(false);
      form.reset();
      toast({
        title: "All done!",
        description: "Your routine has been submitted.",
      });
    },
    onError: (error) => {
      toast({
        title: "An error occurred",
        description: error.message,
        variant: "destructive",
        duration: 30000,
      });
    },
  });

  function onSubmit(values: z.infer<typeof createRoutineSchema>) {
    createRoutine.mutate(values);
  }

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
        <SheetContent
          onInteractOutside={(event) => event.preventDefault()}
          className="flex min-w-[500px] flex-col overflow-auto"
        >
          <SheetHeader className="mb-4">
            <SheetTitle>Submit new routine</SheetTitle>
            <SheetDescription>
              This will submit a new routine that others can see and vote on.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
                  </FormItem>
                )}
              />
              <div className="py-2">
                <p className="text-md mb-4 font-semibold">
                  Configure playlist(s) *
                </p>
                {fields.length === 0 && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    You must add at least one playlist
                  </p>
                )}
                {fields.map((playlist, index) => (
                  <div key={playlist.id} className="my-2 flex gap-2">
                    <FormField
                      control={form.control}
                      name={`playlists.${index}.title`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter title" {...field} />
                          </FormControl>
                          <FormDescription>
                            For example "Bronze" or "Silver"
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`playlists.${index}.reference`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Reference *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                form.getValues().game === Game.KOVAAKS
                                  ? "Enter share code"
                                  : "Enter URL"
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {form.getValues().game === Game.KOVAAKS
                              ? "The share code to add this routine in Kovaaks"
                              : "The URL to open this routine in Aimlabs"}
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <div className="flex pt-[32px]">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          remove(index);
                        }}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    append({ title: "", reference: "" });
                  }}
                >
                  <PlusIcon /> Add playlist
                </Button>
              </div>
              <FormField
                control={form.control}
                name="isBenchmark"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>This is a benchmark</FormLabel>
                      <FormDescription>
                        Users can add their own score sheets to this routine.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <SheetFooter className="mt-4">
                <SheetClose asChild>
                  <Button
                    type="submit"
                    disabled={
                      createRoutine.isPending ||
                      !form.formState.isDirty ||
                      !form.formState.isValid
                    }
                  >
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
