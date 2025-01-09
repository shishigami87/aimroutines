import { z } from "zod";
import { Game } from "@prisma/client";

export const createRoutineSchema = z.object({
  title: z.string().min(1).max(64),
  description: z.string().max(4096).optional(),
  author: z.string().max(64).optional(),
  authorHandle: z.string().max(32).optional(),
  game: z.nativeEnum(Game),
  externalResource: z.string().max(256).optional(),
  isBenchmark: z.boolean(),
  playlists: z
    .array(
      z.object({
        title: z.string().min(1).max(64),
        reference: z.string().min(1).max(256),
      }),
    )
    .min(1),
});
