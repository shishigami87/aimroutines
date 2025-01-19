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
          "beginner-recommendations",
          "liked-routines",
          "benchmarks",
          "active-benchmarks",
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
        ...(strategy === "all-routines" && {
          where: {
            isBenchmark: false,
          },
        }),
        ...(strategy === "benchmarks" && {
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
        ...(strategy === "beginner-recommendations" && {
          where: {
            id: {
              in: [
                "cm5igcr6v000goyptyjaphorx", // Voltaic Kovaaks Benchmarks S5 BETA
                "cm5ig26ik0008oyptcrkphc6u", // Voltaic Aimlabs Benchmarks S3
                "cm5l79ku7000a4ns2qd4g798h", // Voltaic Kovaaks Fundamentals
                "cm5l8bb3m0000sb2dcuj75i53", // Voltaic Aimlabs Fundamentals
                "cm5nwacli0000hqzsbpgficzz", // VDIM for Kovaaks S4 - Dynamic Clicking
                "cm5nwacli0005hqzslhc3gdpr", // VDIM for Kovaaks S4 - Static Clicking
                "cm5nwacli000ahqzsrbw4n5k6", // VDIM for Kovaaks S4 - Smooth Tracking
                "cm5nwacli000fhqzs5f0x2n2o", // VDIM for Kovaaks S4 - Reactive Tracking
                "cm5nwaclj000khqzsh5xfrthj", // VDIM for Kovaaks S4 - Speed TS
                "cm5nwaclj000phqzsxvqkcnou", // VDIM for Kovaaks S4 - Evasive TS
                "cm5nwaclj000uhqzsu28uffvs", // VDIM for Kovaaks S4 - Movement Aiming
                "cm5nx14e70000hq94drpn30t1", // VDIM for Aimlabs S2 - Dynamic Clicking
                "cm5nx14e70005hq9421i0osho", // VDIM for Aimlabs S2 - Static Clicking
                "cm5nx14e7000ahq94s0u8vkhh", // VDIM for Aimlabs S2 - Precise Tracking
                "cm5nx14e7000fhq94ewdo99cr", // VDIM for Aimlabs S2 - Reactive Tracking
                "cm5nx14e7000khq946d4d02cy", // VDIM for Aimlabs S2 - Speed TS
                "cm5nx14e7000phq942b5onmda", // VDIM for Aimlabs S2 - Evasive TS
              ],
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
          templateSheet: routine.templateSheet,
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
        templateSheet: routine.templateSheet,
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
          templateSheet: input.templateSheet,
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
