"use client";

import { api } from "@/trpc/react";

import { useToast } from "@/hooks/use-toast";

export function Crosshairs() {
  const { toast } = useToast();

  const utils = api.useUtils();

  const [crosshairs] = api.resource.getCrosshairs.useSuspenseQuery();

  return (
    <div className="w-full max-w-4xl">
      {crosshairs && crosshairs.length > 0 ? (
        crosshairs.map((crosshair) => (
          <img key={crosshair.hash} src={crosshair.url} alt="" />
        ))
      ) : (
        <p className="text-center text-primary-foreground">
          There are no crosshairs yet.
        </p>
      )}
    </div>
  );
}
