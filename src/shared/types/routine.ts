import { Playlist, Routine } from "@prisma/client";

export type RoutineData = Pick<
  Routine,
  | "id"
  | "title"
  | "author"
  | "authorHandle"
  | "description"
  | "externalResource"
  | "game"
  | "isBenchmark"
> & {
  likes: number;
  liked: boolean;
  playlists: Playlist[];
  benchmarkSheet?: string;
};
