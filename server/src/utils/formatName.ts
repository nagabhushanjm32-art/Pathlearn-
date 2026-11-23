/**
 * Format full name into proper Title Case.
 * Handles single-letter initials like "k r punith" -> "K R Punith",
 * as well as normal names "punith" -> "Punith".
 */
export function formatFullName(rawName?: string | null): string {
  if (!rawName || !rawName.trim()) return "Student"
  return rawName
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}
