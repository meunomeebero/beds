import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Internal only: BEDS never exposes className to consumers (check-library FORBIDDEN). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
