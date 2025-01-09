ALTER TABLE "Playlist" RENAME TO "Routine";
ALTER TABLE "Routine" RENAME CONSTRAINT "Playlist_pkey" TO "Routine_pkey";
ALTER TABLE "Routine" RENAME CONSTRAINT "Playlist_submittedById_fkey" TO "Routine_submittedById_fkey";
-- ALTER INDEX "Playlist_pkey" RENAME TO "Routine_pkey";
ALTER INDEX "Playlist_reference_key" RENAME TO "Routine_reference_key";
ALTER INDEX "Playlist_title_key" RENAME TO "Routine_title_key";

ALTER TABLE "PlaylistLiked" RENAME TO "RoutineLiked";
ALTER TABLE "RoutineLiked" RENAME "playlistId" TO "routineId";
ALTER TABLE "RoutineLiked" RENAME CONSTRAINT "PlaylistLiked_pkey" TO "RoutineLiked_pkey";
ALTER TABLE "RoutineLiked" RENAME CONSTRAINT "PlaylistLiked_playlistId_fkey" TO "RoutineLiked_routineId_fkey";
ALTER TABLE "RoutineLiked" RENAME CONSTRAINT "PlaylistLiked_userId_fkey" TO "RoutineLiked_userId_fkey";
-- ALTER INDEX "PlaylistLiked_pkey" RENAME TO "RoutineLiked_pkey";