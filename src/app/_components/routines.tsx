"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  PlayIcon,
  HeartIcon,
  HeartFilledIcon,
  TwitterLogoIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { api } from "@/trpc/react";
import { Game, Playlist, Routine } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

import { useToast } from "@/hooks/use-toast";
import { capitalize, getPlayButtonUri } from "@/lib/utils";
import { RoutineData } from "@/shared/types/routine";
import { User } from "next-auth";
import { RoutineTableActions } from "./routineTableActions";
import { Strategy } from "@/lib/constants";
import { sortPlaylistsByDifficulty } from "@/lib/sorting";
import { useParams } from "next/navigation";

type RoutinesProps = {
  user: User | null | undefined;
};

export function Routines({ user }: RoutinesProps) {
  const params = useParams();

  const utils = api.useUtils();

  const [strategy, setStrategy] = useState<Strategy>("all-routines");

  const [routines] = api.routine.getRoutines.useSuspenseQuery({
    strategy,
  });

  const [highlightedRoutine, setHighlightedRoutine] = useState<RoutineData>();

  useEffect(() => {
    if (!routines) {
      return;
    }

    const { hash } = window.location;
    if (hash.startsWith("#")) {
      const shareId = hash.substring(1);

      if (shareId.length > 0) {
        const routine = routines.find((routine) => routine.id === shareId);

        if (routine) {
          setHighlightedRoutine(routine);
        }
      }
    }
  }, [params, routines]);

  const toggleLike = api.routine.toggleLike.useMutation({
    onSuccess: async () => {
      await utils.routine.invalidate();
    },
  });

  const columns: ColumnDef<RoutineData>[] = [
    {
      accessorKey: "likes",
      accessorFn: (routine) => routine.likes,
      header: ({ column }) => {
        const isSorted = column.getIsSorted();

        let SortIcon = ArrowUpDown;

        if (isSorted === "asc") {
          SortIcon = ArrowUp;
        } else if (isSorted === "desc") {
          SortIcon = ArrowDown;
        }

        return (
          <Button
            variant="link"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 text-muted-foreground"
          >
            Likes
            <SortIcon />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.original.likes}</div>
      ),
    },
    {
      accessorKey: "actionsPlay",
      header: "",
      cell: ({ row }) => {
        const playlists = row.original.playlists.sort(
          sortPlaylistsByDifficulty,
        );
        const game = row.original.game;

        if (playlists.length < 1) {
          return "";
        }

        if (playlists.length > 1) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="link"
                  className="p-0 font-medium text-primary-foreground"
                >
                  <span className="sr-only">Open menu</span>
                  <PlayIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right">
                <DropdownMenuLabel>Start playlist</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {playlists.map((playlist) => (
                    <DropdownMenuItem key={playlist.title} asChild>
                      <Link
                        href={getPlayButtonUri(playlist.reference, game)}
                        target="_blank"
                      >
                        {playlist.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        const firstPlaylist = playlists.at(0)!;

        return (
          <Button
            variant="link"
            className="p-0 font-medium text-primary-foreground"
          >
            <Link
              href={getPlayButtonUri(firstPlaylist.reference, game)}
              target="_blank"
            >
              <PlayIcon />
            </Link>
          </Button>
        );
      },
    },
    {
      accessorKey: "title",
      filterFn: (row, columnId, filterValue) => {
        const query = (filterValue as string).toLowerCase();
        const title = row.original.title.toLowerCase();
        const shareCodes = row.original.playlists
          .map((playlist) => playlist.reference)
          .join()
          .toLowerCase();

        return (
          title.includes(query) ||
          (query.startsWith("kovaaks") && shareCodes.includes(query)) // only check for a matching share code if the query starts with "kovaaks" to avoid false positives
        );
      },
      header: ({ column }) => {
        const isSorted = column.getIsSorted();

        let SortIcon = ArrowUpDown;

        if (isSorted === "asc") {
          SortIcon = ArrowUp;
        } else if (isSorted === "desc") {
          SortIcon = ArrowDown;
        }

        return (
          <Button
            variant="link"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 text-muted-foreground"
          >
            Title
            <SortIcon />
          </Button>
        );
      },
      cell: ({ row }) => {
        const { title, description } = row.original;

        if (!description) {
          return title;
        }

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex gap-2">
                  <span>{title}</span>
                  <div className="flex items-center justify-center p-0 text-gray-400">
                    <InfoCircledIcon />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-md font-medium">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "author",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();

        let SortIcon = ArrowUpDown;

        if (isSorted === "asc") {
          SortIcon = ArrowUp;
        } else if (isSorted === "desc") {
          SortIcon = ArrowDown;
        }

        return (
          <Button
            variant="link"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 text-muted-foreground"
          >
            Author
            <SortIcon />
          </Button>
        );
      },
      cell: ({ row }) => {
        const author = row.original.author;
        const authorHandle = row.original.authorHandle;

        if (!author) {
          return "Unknown";
        }

        if (authorHandle) {
          return (
            <Button
              variant="link"
              className="gap-1 p-0 font-medium text-primary-foreground"
              asChild
            >
              <Link href={`https://x.com/${authorHandle}`} target="_blank">
                {author} <TwitterLogoIcon />
              </Link>
            </Button>
          );
        }

        return author;
      },
    },
    {
      accessorKey: "game",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();

        let SortIcon = ArrowUpDown;

        if (isSorted === "asc") {
          SortIcon = ArrowUp;
        } else if (isSorted === "desc") {
          SortIcon = ArrowDown;
        }

        return (
          <Button
            variant="link"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 text-muted-foreground"
          >
            Game
            <SortIcon />
          </Button>
        );
      },
      cell: ({ row }) => capitalize(row.original.game),
    },
    {
      accessorKey: "actionsLike",
      header: "",
      cell: ({ row }) => {
        if (!user) {
          return "";
        }

        const liked = row.original.liked;

        return (
          <Button
            size="icon"
            variant="link"
            className="p-0 font-medium text-primary-foreground"
            onClick={() => {
              toggleLike.mutate({
                routineId: row.original.id,
              });
            }}
            disabled={toggleLike.isPending}
          >
            {liked ? <HeartFilledIcon /> : <HeartIcon />}
          </Button>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => {
        return <RoutineTableActions routine={row.original} user={user} />;
      },
    },
  ];

  return (
    <div className="w-full max-w-4xl">
      {routines ? (
        <DataTable
          columns={columns}
          data={routines}
          onStrategyChange={(newStrategy) => {
            setStrategy(newStrategy);
          }}
          user={user}
          highlightedRowId={highlightedRoutine?.id}
        />
      ) : (
        <p>There are no routines yet.</p>
      )}
    </div>
  );
}
