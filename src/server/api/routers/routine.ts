import { z } from "zod";

import {
  createTRPCRouter,
  privilegedModeratorProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { Game } from "@prisma/client";
import { createRoutineSchema } from "@/shared/schemas/routine";
import { auth } from "@/server/auth";
import { TRPCError } from "@trpc/server";

export const routineRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ text: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      const routines = await ctx.db.routine.findMany({
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
      const routinesSortedByLikes = routines.sort(
        (a, b) => b._count.likedByUsers - a._count.likedByUsers,
      );

      if (userId) {
        const routinesWithMyOwnLike = routinesSortedByLikes.map((routine) => ({
          id: routine.id,
          title: routine.title,
          author: routine.author,
          authorHandle: routine.authorHandle,
          reference: routine.reference,
          description: routine.description,
          externalResource: routine.externalResource,
          game: routine.game,
          likes: routine._count.likedByUsers,
          liked: routine.likedByUsers.find(
            (likedByUser) => likedByUser.userId === userId,
          )
            ? true
            : false,
        }));

        return routinesWithMyOwnLike;
      }

      return routinesSortedByLikes.map((routine) => ({
        id: routine.id,
        title: routine.title,
        author: routine.author,
        authorHandle: routine.authorHandle,
        reference: routine.reference,
        description: routine.description,
        externalResource: routine.externalResource,
        game: routine.game,
        likes: routine._count.likedByUsers,
        liked: false,
      }));
    }),

  create: privilegedModeratorProcedure
    .input(createRoutineSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.routine.create({
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
    .input(z.object({ routineId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { routineId } = input;

      // Does this routine exist?
      const routine = await ctx.db.routine.findUnique({
        where: {
          id: routineId,
        },
        include: {
          likedByUsers: true,
        },
      });

      if (!routine) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Did we already like it?
      const likedByUser = routine.likedByUsers.find(
        (likedByUser) => likedByUser.userId === userId,
      );

      // If we already liked it, remove the like. Otherwise, add it.
      if (likedByUser) {
        await ctx.db.routineLiked.delete({
          where: {
            routineId_userId: { routineId, userId },
          },
        });
      } else {
        await ctx.db.routineLiked.create({
          data: {
            user: { connect: { id: userId } },
            routine: { connect: { id: routineId } },
          },
        });
      }
    }),
});
