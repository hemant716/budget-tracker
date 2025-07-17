import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
};
export function serializeDecimal(obj) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" || value?.constructor?.name === "Decimal"
        ? value.toString()
        : value
    )
  );
};
