import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { ResourceType } from "@prisma/client";

export const resourceRouter = createTRPCRouter({
  getCrosshairs: publicProcedure.query(async ({ ctx }) => {
    const crosshairs = await ctx.db.resource.findMany({
      where: {
        type: ResourceType.CROSSHAIR,
      },
    });
    return crosshairs;
  }),
});
