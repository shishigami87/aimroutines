import { z } from "zod";

import {
  createTRPCRouter,
  privilegedModeratorProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { Game } from "@prisma/client";
import { createPlaylistSchema } from "@/shared/schemas/playlist";
import { auth } from "@/server/auth";
import { TRPCError } from "@trpc/server";

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
        orderBy: {
          title: "desc",
        },
      });

      // TODO: Extremely high performance code
      const playlistsSortedByLikes = playlists.sort(
        (a, b) => b._count.likedByUsers - a._count.likedByUsers,
      );

      if (userId) {
        const playlistsWithMyOwnLike = playlistsSortedByLikes.map(
          (playlist) => ({
            id: playlist.id,
            title: playlist.title,
            author: playlist.author,
            authorHandle: playlist.authorHandle,
            reference: playlist.reference,
            description: playlist.description,
            externalResource: playlist.externalResource,
            game: playlist.game,
            likes: playlist._count.likedByUsers,
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
        id: playlist.id,
        title: playlist.title,
        author: playlist.author,
        authorHandle: playlist.authorHandle,
        reference: playlist.reference,
        description: playlist.description,
        externalResource: playlist.externalResource,
        game: playlist.game,
        likes: playlist._count.likedByUsers,
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
  toggleLike: protectedProcedure
    .input(z.object({ playlistId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { playlistId } = input;

      // Does this playlist exist?
      const playlist = await ctx.db.playlist.findUnique({
        where: {
          id: playlistId,
        },
        include: {
          likedByUsers: true,
        },
      });

      if (!playlist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Did we already like it?
      const likedByUser = playlist.likedByUsers.find(
        (likedByUser) => likedByUser.userId === userId,
      );

      // If we already liked it, remove the like. Otherwise, add it.
      if (likedByUser) {
        await ctx.db.playlistLiked.delete({
          where: {
            playlistId_userId: { playlistId, userId },
          },
        });
      } else {
        await ctx.db.playlistLiked.create({
          data: {
            user: { connect: { id: userId } },
            playlist: { connect: { id: playlistId } },
          },
        });
      }
    }),
});
