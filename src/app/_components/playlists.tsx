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

export function Playlists() {
  const [playlists] = api.playlist.getAll.useSuspenseQuery({});

  const { toast } = useToast();

  const columns: ColumnDef<Playlist>[] = [
    {
      accessorKey: "likes",
      accessorFn: (playlist) => playlist._count.likedByUsers,
      header: "Likes",
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => {
        const author = row.getValue<Playlist["author"]>("author");
        const authorHandle =
          row.getValue<Playlist["authorHandle"]>("authorHandle");

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
      accessorKey: "authorHandle",
      header: () => {},
      cell: () => {},
    },
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => {
        const reference = row.getValue<Playlist["reference"]>("reference");
        const game = row.getValue<Playlist["game"]>("game");

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

        return (
          <Button
            asChild
            variant="link"
            className="p-0 font-medium text-primary-foreground"
            onClick={() => {
              toast({
                description: "Sharecode copied to clipboard",
              });
            }}
          >
            <Link href={reference} target="_blank">
              Open in Aimlabs <PlayIcon />
            </Link>
          </Button>
        );
      },
    },
    {
      accessorKey: "game",
      header: "Game",
      cell: ({ cell }) => capitalize(cell.getValue<Playlist["game"]>()),
    },
    {
      accessorKey: "externalResource",
      header: "",
      cell: ({ cell }) => {
        const externalResource = cell.getValue<Playlist["externalResource"]>();

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
      accessorKey: "liked",
      header: () => {},
      cell: () => {},
    },
    {
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => {
        const liked = row.getValue<boolean>("liked"); // TODO: type safety

        console.log("liked", liked);

        return (
          <Button
            size="icon"
            variant="link"
            className="p-0 font-medium text-primary-foreground"
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
