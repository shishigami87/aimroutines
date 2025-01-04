import { z } from "zod";
import { Game } from "@prisma/client";

export const createPlaylistSchema = z.object({
  title: z.string().min(4).max(64),
  description: z.string().max(4096).optional(),
  author: z.string().max(64).optional(),
  authorHandle: z.string().max(32).optional(),
  game: z.nativeEnum(Game),
  reference: z.string().min(8).max(256),
  externalResource: z.string().max(256).optional(),
});
