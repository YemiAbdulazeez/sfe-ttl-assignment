import type { Transaction } from '@/types/api'
import { Icon } from '@/components/ui'
import { formatSignedAmount, formatTime, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { cx } from '@/lib/cx'
import { StatusPill } from './StatusPill'
import { transactionMark } from './transactionMark'
import styles from './TransactionListRow.module.css'

function RowMark({ transaction }: { transaction: Transaction }) {
  const mark = transactionMark(transaction)
  if ('initials' in mark) return <span className={styles.well}>{mark.initials}</span>
  return (
    <span className={styles.well}>
      <Icon name={mark.icon} size={18} />
    </span>
  )
}

export function TransactionListRow({
  transaction,
  selected,
  onSelect,
}: {
  transaction: Transaction
  selected: boolean
  onSelect: (id: string, opener: HTMLButtonElement) => void
}) {
  const amount = formatSignedAmount(transaction.type, transaction.amount, transaction.currency)

  return (
    <button
      type="button"
      className={cx(styles.row, selected && styles.selected)}
      aria-pressed={selected}
      onClick={(event) => onSelect(transaction.id, event.currentTarget)}
    >
      <RowMark transaction={transaction} />
      <span className={styles.identity}>
        <span className={styles.title}>{TRANSACTION_TYPE_LABELS[transaction.type]}</span>
        <span className={styles.narration}>{transaction.narration}</span>
      </span>
      <StatusPill status={transaction.status} />
      <span className={styles.money}>
        <span className={amount.tone === 'credit' ? styles.credit : styles.amount}>{amount.text}</span>
        <span className={styles.time}>{formatTime(transaction.createdAt)}</span>
      </span>
    </button>
  )
}
