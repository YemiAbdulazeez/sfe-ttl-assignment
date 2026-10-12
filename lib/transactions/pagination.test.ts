import { PAGE_ELLIPSIS, paginationItems, showingLabel } from './pagination'

describe('paginationItems', () => {
  it('lists every page when there are seven or fewer', () => {
    expect(paginationItems(2, 4)).toEqual([1, 2, 3, 4])
    expect(paginationItems(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('matches the frame windows', () => {
    expect(paginationItems(1, 12)).toEqual([1, 2, 3, PAGE_ELLIPSIS, 12])
    expect(paginationItems(6, 12)).toEqual([1, PAGE_ELLIPSIS, 5, 6, 7, PAGE_ELLIPSIS, 12])
    expect(paginationItems(12, 12)).toEqual([1, PAGE_ELLIPSIS, 10, 11, 12])
  })

  it('drops an ellipsis when the neighbours touch an end', () => {
    expect(paginationItems(3, 12)).toEqual([1, 2, 3, 4, PAGE_ELLIPSIS, 12])
    expect(paginationItems(10, 12)).toEqual([1, PAGE_ELLIPSIS, 9, 10, 11, 12])
  })
})

describe('showingLabel', () => {
  it('uses an en dash and the page bounds', () => {
    expect(showingLabel(1, 20, 237)).toBe('Showing 1\u201320 of 237')
    expect(showingLabel(12, 20, 237)).toBe('Showing 221\u2013237 of 237')
  })
})
