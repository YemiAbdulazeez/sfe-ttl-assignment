import type { Transaction } from '@/types/api'
import { formatGroupLabel } from '@/lib/format'

export interface TransactionGroup {
  label: string
  transactions: Transaction[]
}

/** Groups rows in API order. A new local calendar day starts a new group. */
export function groupTransactions(
  transactions: readonly Transaction[],
  now = new Date()
): TransactionGroup[] {
  const groups: TransactionGroup[] = []
  for (const transaction of transactions) {
    const label = formatGroupLabel(transaction.createdAt, now)
    const current = groups[groups.length - 1]
    if (current && current.label === label) current.transactions.push(transaction)
    else groups.push({ label, transactions: [transaction] })
  }
  return groups
}
