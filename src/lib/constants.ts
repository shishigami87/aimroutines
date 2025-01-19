// TODO: add constants:

// all-routines
// liked-routines
// only-benchmarks
// active-benchmarks
// no-benchmarks

export const Strategies = {
  ["all-routines"]: "All routines",
  ["liked-routines"]: "Liked routines",
  ["beginner-recommendations"]: "Beginner routines",
  ["benchmarks"]: "Benchmarks",
  ["active-benchmarks"]: "Active benchmarks",
} as const;

export type Strategy = keyof typeof Strategies;

// Use these constants in the select dropdown in the DataTable component.
// Use these constants in the API route to filter the routines.
