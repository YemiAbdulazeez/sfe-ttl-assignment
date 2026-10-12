import type { Currency, TransactionType } from '@/types/api'
import { formatMoney } from './money'

export type AmountTone = 'credit' | 'neutral'

const MINUS = '\u2212'

function signFor(type: TransactionType): '+' | typeof MINUS | '' {
  switch (type) {
    case 'deposit':
    case 'transfer_in':
      return '+'
    case 'withdrawal':
    case 'transfer_out':
    case 'card_payment':
    case 'bill_payment':
      return MINUS
    case 'conversion':
      return ''
    default: {
      const exhaustive: never = type
      return exhaustive
    }
  }
}

/** Signed display amount. Conversion has no sign. Debits use a minus (U+2212). */
export function formatSignedAmount(
  type: TransactionType,
  amount: number,
  currency: Currency
): { text: string; tone: AmountTone } {
  const sign = signFor(type)
  return {
    text: `${sign}${formatMoney(amount, currency)}`,
    tone: sign === '+' ? 'credit' : 'neutral',
  }
}
