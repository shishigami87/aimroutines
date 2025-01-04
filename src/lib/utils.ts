import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(text: string) {
  return `${text.charAt(0).toUpperCase()}${text.substring(1, text.length).toLowerCase()}`;
}
