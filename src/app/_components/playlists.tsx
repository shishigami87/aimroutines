"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  OpenInNewWindowIcon,
  CopyIcon,
  PlayIcon,
  HeartIcon,
  HeartFilledIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";

import { api } from "@/trpc/react";
import { Game, Playlist } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { capitalize } from "@/lib/utils";
import { PlaylistWithLikes } from "@/shared/types/playlist";
import { User } from "next-auth";

type PlaylistsProps = {
  user: User | null | undefined;
};

export function Playlists({ user }: PlaylistsProps) {
  const { toast } = useToast();

  const utils = api.useUtils();

  const [playlists] = api.playlist.getAll.useSuspenseQuery({});

  const toggleLike = api.playlist.toggleLike.useMutation({
    onSuccess: async () => {
      await utils.playlist.invalidate();
    },
  });

  const columns: ColumnDef<PlaylistWithLikes>[] = [
    {
      accessorKey: "likes",
      accessorFn: (playlist) => playlist.likes,
      header: "Likes",
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.original.likes}</div>
      ),
    },
    {
      accessorKey: "actionsPlay",
      header: "",
      cell: ({ row }) => {
        const reference = row.original.reference;
        const game = row.original.game;

        if (game === Game.KOVAAKS) {
          return (
            <Button
              variant="link"
              className="p-0 font-medium text-primary-foreground"
            >
              <Link
                href={`steam://run/824270/?action=jump-to-playlist;sharecode=${reference}`}
                target="_blank"
              >
                <PlayIcon />
              </Link>
            </Button>
          );
        }

        return (
          <Button
            variant="link"
            className="p-0 font-medium text-primary-foreground"
          >
            <Link href={reference} target="_blank">
              <PlayIcon />
            </Link>
          </Button>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "author",
      header: "Author",
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
      accessorKey: "reference",
      header: "Share code",
      cell: ({ row }) => {
        const reference = row.original.reference;
        const game = row.original.game;

        if (game === Game.KOVAAKS) {
          return (
            <Button
              variant="link"
              className="p-0 font-medium text-primary-foreground"
              onClick={() => {
                navigator.clipboard.writeText(reference);
                toast({
                  description: "Sharecode copied to clipboard",
                });
              }}
            >
              {reference}
              <CopyIcon />
            </Button>
          );
        }

        return "N/A";
      },
    },
    {
      accessorKey: "game",
      header: "Game",
      cell: ({ row }) => capitalize(row.original.game),
    },
    {
      accessorKey: "externalResource",
      header: "",
      cell: ({ row }) => {
        const externalResource = row.original.externalResource;

        if (externalResource) {
          return (
            <Button
              asChild
              variant="link"
              size="icon"
              className="p-0 font-medium text-primary-foreground"
            >
              <Link href={externalResource} target="_blank">
                <OpenInNewWindowIcon />
              </Link>
            </Button>
          );
        }

        return "";
      },
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
                playlistId: row.original.id,
              });
            }}
            disabled={toggleLike.isPending}
          >
            {liked ? <HeartFilledIcon /> : <HeartIcon />}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="w-full max-w-7xl">
      {playlists ? (
        <DataTable columns={columns} data={playlists} />
      ) : (
        <p>There are no playlists yet.</p>
      )}
    </div>
  );
}
