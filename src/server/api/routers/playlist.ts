import { z } from "zod";

import {
  createTRPCRouter,
  privilegedModeratorProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { Game } from "@prisma/client";
import { createPlaylistSchema } from "@/shared/schemas/playlist";

export const playlistRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ text: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      const playlists = await ctx.db.playlist.findMany({
        include: {
          _count: {
            select: {
              likedByUsers: true,
            },
          },
          likedByUsers: true,
        },
      });

      // TODO: Extremely high performance code
      const playlistsSortedByLikes = playlists.sort(
        (a, b) => b._count.likedByUsers - a._count.likedByUsers,
      );

      if (userId) {
        const playlistsWithMyOwnLike = playlistsSortedByLikes.map(
          (playlist) => ({
            ...playlist,
            liked: playlist.likedByUsers.find(
              (likedByUser) => likedByUser.userId === userId,
            )
              ? true
              : false,
          }),
        );

        return playlistsWithMyOwnLike;
      }

      return playlistsSortedByLikes.map((playlist) => ({
        ...playlist,
        liked: false,
      }));
    }),

  create: privilegedModeratorProcedure
    .input(createPlaylistSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.playlist.create({
        data: {
          author: input.author,
          authorHandle: input.authorHandle,
          game: input.game,
          reference: input.reference,
          title: input.title,
          description: input.description,
          externalResource: input.externalResource,
          submittedBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
});
