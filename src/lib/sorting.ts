/*
Advanced
Advanced Plus
Beginner
Bronze
Diamond
Easy
Elite
Entry
Extra
Gold
Grandmaster
Hard
Initiate
Intermediate
Iron
Jade
Main
Normal
Novice
Platinum
Silver
*/

import { Playlist } from "@prisma/client";

const DIFFULTY_ORDER: Record<string, number> = {
  // Fundamentals
  Iron: 0,
  Bronze: 1,
  Silver: 2,
  Gold: 3,
  Platinum: 4,
  Diamond: 5,
  Jade: 6,
  Master: 7,
  Grandmaster: 8,

  // Modern benchmarks
  Novice: 1,
  Intermediate: 2,
  Advanced: 3,

  // Alternate benchmarks
  Easy: 0,
  Hard: 1,

  // TSK benchmarks
  Beginner: 0,
  Main: 1,
  Extra: 2,

  // Aimlabs VDIM
  Entry: 0,
  // Novice: 1
  // Intermediate: 2
  // Advanced: 3
  Elite: 4,

  // Kovaaks VDIM
  Initiate: 0,
  // Novice: 1
  // Intermediate: 2
  // Advanced: 3
  "Advanced Plus": 4,

  // Deadman's Benchmarks
  "Level 1": 0,
  "Level 1 Pokeball": 1,
  "Level 2": 2,
  "Level 2 Pokeball": 3,
  "Level 3": 4,
  "Level 3 Pokeball": 5,
  "Level 4": 6,
  "Level 4 Pokeball": 7,
  Boss: 8,
  "Boss Pokeball": 9,
  "Boss+": 10,
  "Boss+ Pokeball": 11,
  "Boss++": 12,
  "Boss++ Pokeball": 13,
} as const;

export function sortPlaylistsByDifficulty(a: Playlist, b: Playlist) {
  const aOrder = a.title in DIFFULTY_ORDER ? DIFFULTY_ORDER[a.title]! : 99;
  const bOrder = b.title in DIFFULTY_ORDER ? DIFFULTY_ORDER[b.title]! : 99;
  return aOrder - bOrder;
}
