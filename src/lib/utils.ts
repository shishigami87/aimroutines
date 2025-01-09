import { Game } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(text: string) {
  return `${text.charAt(0).toUpperCase()}${text.substring(1, text.length).toLowerCase()}`;
}

export function getPlayButtonUri(reference: string, game: Game) {
  if (game === Game.KOVAAKS) {
    return `steam://run/824270/?action=jump-to-playlist;sharecode=${reference}`;
  }

  // For Aimlabs we store the URI directly since there are no share codes we would want to save
  return reference;
}
