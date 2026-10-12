import type { Transaction } from '@/types/api'
import { groupTransactions } from './group'

function transaction(id: string, createdAt: string): Transaction {
  return {
    id,
    reference: id,
    type: 'deposit',
    status: 'successful',
    currency: 'NGN',
    amount: 100,
    fee: 0,
    narration: id,
    counterparty: null,
    createdAt,
  }
}

describe('groupTransactions', () => {
  it('keeps API order and starts a group when the local day changes', () => {
    const newer = new Date(2026, 9, 6, 9, 0, 0)
    const older = new Date(2026, 9, 5, 18, 0, 0)
    const groups = groupTransactions(
      [transaction('a', newer.toISOString()), transaction('b', older.toISOString())],
      newer
    )
    expect(groups.map((group) => group.label)).toEqual(['TODAY', 'YESTERDAY'])
    expect(groups[0]?.transactions.map((item) => item.id)).toEqual(['a'])
    expect(groups[1]?.transactions.map((item) => item.id)).toEqual(['b'])
  })

  it('does not merge the same day across another day', () => {
    const first = new Date(2026, 9, 6, 9, 0, 0)
    const second = new Date(2026, 9, 5, 9, 0, 0)
    const third = new Date(2026, 9, 6, 8, 0, 0)
    const groups = groupTransactions(
      [
        transaction('a', first.toISOString()),
        transaction('b', second.toISOString()),
        transaction('c', third.toISOString()),
      ],
      first
    )
    expect(groups).toHaveLength(3)
    expect(groups.map((group) => group.transactions[0]?.id)).toEqual(['a', 'b', 'c'])
  })
})
