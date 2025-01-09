import { Routine } from "@prisma/client";

export type RoutineWithLikes = Pick<
  Routine,
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
