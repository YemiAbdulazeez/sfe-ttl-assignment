/** Two-letter mark for a counterparty. Null when there is nothing to abbreviate. */
export function counterpartyInitials(counterparty: string | null | undefined): string | null {
  const words = counterparty?.trim().split(/\s+/).filter(Boolean) ?? []
  if (words.length === 0) return null
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}
