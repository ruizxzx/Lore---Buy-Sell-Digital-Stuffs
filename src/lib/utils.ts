import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate an ID for neo-brutal elements if needed
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
