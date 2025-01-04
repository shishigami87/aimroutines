import { Playlist } from "@prisma/client";

export type PlaylistWithLikes = Pick<
  Playlist,
  | "id"
  | "title"
  | "author"
  | "authorHandle"
  | "reference"
  | "description"
  | "externalResource"
  | "game"
> & {
  likes: number;
  liked: boolean;
};
