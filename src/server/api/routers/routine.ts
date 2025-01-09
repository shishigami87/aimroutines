import { z } from "zod";

import {
  createTRPCRouter,
  privilegedModeratorProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { createRoutineSchema } from "@/shared/schemas/routine";
import { TRPCError } from "@trpc/server";

export const routineRouter = createTRPCRouter({
  getRoutines: publicProcedure
    .input(
      z.object({
        strategy: z.enum([
          "all-routines",
          "liked-routines",
          "only-benchmarks",
          "active-benchmarks",
          "no-benchmarks",
        ]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      const { strategy } = input; // TODO: use constants

      const routines = await ctx.db.routine.findMany({
        include: {
          _count: {
            select: {
              likedByUsers: true,
            },
          },
          likedByUsers: true,
          benchmarkedByUsers: true,
          playlist: true,
        },
        orderBy: {
          title: "desc",
        },
        ...(strategy === "no-benchmarks" && {
          where: {
            isBenchmark: false,
          },
        }),
        ...(strategy === "only-benchmarks" && {
          where: {
            isBenchmark: true,
          },
        }),
        ...(strategy === "active-benchmarks" && {
          where: {
            isBenchmark: true,
            benchmarkedByUsers: {
              some: {
                userId,
              },
            },
          },
        }),
        ...(strategy === "liked-routines" && {
          where: {
            likedByUsers: {
              some: {
                userId,
              },
            },
          },
        }),
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
          playlists: routine.playlist,
          description: routine.description,
          externalResource: routine.externalResource,
          game: routine.game,
          isBenchmark: routine.isBenchmark,
          likes: routine._count.likedByUsers,
          liked: routine.likedByUsers.find(
            (likedByUser) => likedByUser.userId === userId,
          )
            ? true
            : false,
          benchmarkSheet: routine.benchmarkedByUsers.find(
            (benchmarkedByUser) => benchmarkedByUser.userId === userId,
          )?.url,
        }));

        return routinesWithMyOwnLike;
      }

      return routinesSortedByLikes.map((routine) => ({
        id: routine.id,
        title: routine.title,
        author: routine.author,
        authorHandle: routine.authorHandle,
        playlists: routine.playlist,
        description: routine.description,
        externalResource: routine.externalResource,
        game: routine.game,
        isBenchmark: routine.isBenchmark,
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
          title: input.title,
          description: input.description,
          externalResource: input.externalResource,
          isBenchmark: input.isBenchmark,
          submittedBy: { connect: { id: ctx.session.user.id } },
          playlist: { createMany: { data: input.playlists } },
        },
      });
    }),
  addBenchmark: protectedProcedure
    .input(z.object({ routineId: z.string(), url: z.string().min(1).max(256) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { routineId, url } = input;

      // Does this routine exist?
      const routine = await ctx.db.routine.findUnique({
        where: {
          id: routineId,
        },
        include: {
          benchmarkedByUsers: true,
        },
      });

      if (!routine) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Did we already add a benchmark?
      if (
        routine.benchmarkedByUsers.find(
          (benchmarkedByUser) => benchmarkedByUser.userId === userId,
        )
      ) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      await ctx.db.routineBenchmark.create({
        data: {
          url,
          user: { connect: { id: userId } },
          routine: { connect: { id: routineId } },
        },
      });
    }),
  removeBenchmark: protectedProcedure
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
          benchmarkedByUsers: true,
        },
      });

      if (!routine) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Did we already add a benchmark?
      if (
        !routine.benchmarkedByUsers.find(
          (benchmarkedByUser) => benchmarkedByUser.userId === userId,
        )
      ) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.routineBenchmark.delete({
        where: {
          routineId_userId: { routineId, userId },
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
