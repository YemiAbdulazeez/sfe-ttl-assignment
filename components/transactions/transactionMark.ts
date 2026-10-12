import type { IconName } from '@/components/ui'
import { counterpartyInitials } from '@/lib/format'
import type { Transaction, TransactionType } from '@/types/api'

const TYPE_ICONS: Record<Exclude<TransactionType, 'transfer_in' | 'transfer_out'>, IconName> = {
  deposit: 'arrow-down-left',
  withdrawal: 'arrow-up-right',
  conversion: 'swap',
  card_payment: 'card',
  bill_payment: 'receipt',
}

export type TransactionMark = { initials: string } | { icon: IconName }

/** Initials for a named transfer, otherwise the icon for that type. */
export function transactionMark(transaction: Pick<Transaction, 'type' | 'counterparty'>): TransactionMark {
  if (transaction.type === 'transfer_in' || transaction.type === 'transfer_out') {
    const initials = counterpartyInitials(transaction.counterparty)
    if (initials) return { initials }
    return { icon: transaction.type === 'transfer_in' ? 'arrow-down-left' : 'arrow-up-right' }
  }
  return { icon: TYPE_ICONS[transaction.type] }
}
