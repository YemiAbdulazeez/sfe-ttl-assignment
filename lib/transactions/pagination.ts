export const PAGE_ELLIPSIS = 'ellipsis' as const

export type PageItem = number | typeof PAGE_ELLIPSIS

/**
 * Desktop page buttons.
 * 1 and the last page are always shown. The current page and one neighbour on each
 * side sit between them, clipped so they never repeat an end. On the first or last
 * page the frame shows one extra inward page, so page 1 of 12 is `1 2 3 … 12`.
 * An ellipsis is omitted when the pages on either side differ by 1.
 */
export function paginationItems(current: number, totalPages: number): PageItem[] {
  if (totalPages < 1) return []
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages])
  for (const page of [current - 1, current, current + 1]) {
    if (page >= 2 && page <= totalPages - 1) pages.add(page)
  }
  if (current === 1) pages.add(3)
  if (current === totalPages) pages.add(totalPages - 2)

  const ordered = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)
  const items: PageItem[] = []
  for (let index = 0; index < ordered.length; index += 1) {
    const page = ordered[index]
    const previous = ordered[index - 1]
    if (previous !== undefined && page - previous > 1) items.push(PAGE_ELLIPSIS)
    items.push(page)
  }
  return items
}

export function showingLabel(page: number, limit: number, total: number): string {
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  return `Showing ${start}\u2013${end} of ${total}`
}
