import { useState } from "react";
import Link from "next/link";
import { User } from "next-auth";

import {
  OpenInNewWindowIcon,
  CopyIcon,
  DotsHorizontalIcon,
  Link1Icon,
  LinkBreak1Icon,
  Share1Icon,
} from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import { api } from "@/trpc/react";
import { RoutineData } from "@/shared/types/routine";
import { Game, Playlist } from "@prisma/client";

type RoutineTableActionsProps = {
  routine: RoutineData;
  user: User | null | undefined;
};

export function RoutineTableActions({
  routine,
  user,
}: RoutineTableActionsProps) {
  const utils = api.useUtils();

  const [benchmarkSheetUrl, setBenchmarkSheetUrl] = useState("");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const { toast } = useToast();

  const addBenchmark = api.routine.addBenchmark.useMutation({
    onSuccess: async () => {
      await utils.routine.invalidate();
      toast({
        title: "All done!",
        description: "Your benchmark sheet has been added to this routine.",
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

  const removeBenchmark = api.routine.removeBenchmark.useMutation({
    onSuccess: async () => {
      await utils.routine.invalidate();
      toast({
        title: "All done!",
        description: "Your benchmark sheet has been removed from this routine.",
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-zinc-700 hover:text-white"
          >
            <span className="sr-only">Open menu</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="right">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(routine.game === Game.KOVAAKS || routine.externalResource) && (
            <>
              <DropdownMenuGroup>
                {routine.externalResource && (
                  <DropdownMenuItem asChild>
                    <Link href={routine.externalResource} target="_blank">
                      Open README
                      <div className="ml-auto">
                        <OpenInNewWindowIcon />
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )}
                {routine.game === Game.KOVAAKS &&
                  (routine.playlists.length === 1 ? (
                    <DropdownMenuItem
                      key={routine.playlists[0]!.reference}
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          routine.playlists[0]!.reference,
                        );
                        toast({
                          description: "Sharecode copied to clipboard",
                        });
                      }}
                    >
                      Copy share code
                      <div className="ml-auto">
                        <CopyIcon />
                      </div>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        Copy share code
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {routine.playlists.map((playlist) => (
                            <DropdownMenuItem
                              key={playlist.reference}
                              onClick={async () => {
                                await navigator.clipboard.writeText(
                                  playlist.reference,
                                );
                                toast({
                                  description: "Sharecode copied to clipboard",
                                });
                              }}
                            >
                              {playlist.title}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}
          {routine.isBenchmark && (
            <>
              <DropdownMenuGroup>
                {routine.templateSheet && (
                  <DropdownMenuItem asChild>
                    <Link href={routine.templateSheet} target="_blank">
                      Open template sheet
                      <div className="ml-auto">
                        <OpenInNewWindowIcon />
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )}
                {routine.benchmarkSheet ? (
                  <>
                    <DropdownMenuItem disabled={!user} asChild>
                      <Link href={routine.benchmarkSheet} target="_blank">
                        Open my score sheet
                        <div className="ml-auto">
                          <OpenInNewWindowIcon />
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!user}
                      onClick={() => {
                        setIsRemoveDialogOpen(true);
                      }}
                    >
                      Remove score sheet
                      <div className="ml-auto">
                        <LinkBreak1Icon />
                      </div>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    disabled={!user}
                    onClick={() => {
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    Add score sheet
                    <div className="ml-auto">
                      <Link1Icon />
                    </div>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={async () => {
                await navigator.clipboard.writeText(
                  `${window.location.origin}/#${routine.id}`,
                );
                toast({
                  description: "URL copied to clipboard",
                });
              }}
            >
              Share routine
              <div className="ml-auto">
                <Share1Icon />
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add score sheet</DialogTitle>
            <DialogDescription>
              This will link your own score sheet to this routine, so that you
              can track your progress for this benchmark.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Enter URL to your score sheet"
            value={benchmarkSheetUrl}
            onChange={(e) => {
              setBenchmarkSheetUrl(e.target.value);
            }}
          />
          <DialogFooter>
            <Button
              onClick={async () => {
                addBenchmark.mutate({
                  routineId: routine.id,
                  url: benchmarkSheetUrl,
                });
                await utils.routine.invalidate();
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isRemoveDialogOpen}
        onOpenChange={(open) => {
          setIsRemoveDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will remove your benchmark sheet from this routine. Your
              benchmark sheet will not be deleted, you can simply add it again
              later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="link"
              onClick={() => {
                setIsRemoveDialogOpen(false);
              }}
            >
              No, take me back
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                removeBenchmark.mutate({
                  routineId: routine.id,
                });
                await utils.routine.invalidate();
              }}
            >
              Yes, remove benchmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
