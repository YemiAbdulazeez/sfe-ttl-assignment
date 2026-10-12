import type { Currency, Transaction } from '@/types/api'
import { formatMoney } from '@/lib/format/money'

/** Hero line under the mark. Transfers name the counterparty; every other type uses the narration as text. */
export function detailHeroLine(
  transaction: Pick<Transaction, 'type' | 'counterparty' | 'narration'>
): string {
  if (transaction.type === 'transfer_out' && transaction.counterparty) {
    return `Transfer out to ${transaction.counterparty}`
  }
  if (transaction.type === 'transfer_in' && transaction.counterparty) {
    return `Transfer in from ${transaction.counterparty}`
  }
  return transaction.narration
}

/** Unsigned summary amounts. Total is amount plus fee, both in minor units. */
export function detailSummary(amount: number, fee: number, currency: Currency) {
  return {
    amount: formatMoney(amount, currency),
    fee: formatMoney(fee, currency),
    total: formatMoney(amount + fee, currency),
  }
}
