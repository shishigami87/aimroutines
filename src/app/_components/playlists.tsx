"use client";

import { useState } from "react";

import { api } from "@/trpc/react";

export function Playlists() {
  const [playlists] = api.playlist.getAll.useSuspenseQuery({});

  const utils = api.useUtils();

  return (
    <div className="w-full max-w-xs">
      {playlists && playlists.length > 0 ? (
        playlists.map((playlist) => <li key={playlist.id}>{playlist.title}</li>)
      ) : (
        <p>There are no playlists yet.</p>
      )}
    </div>
  );
}
