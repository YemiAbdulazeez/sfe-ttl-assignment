import { TRANSACTION_STATUS_LABELS } from '@/lib/format'
import { cx } from '@/lib/cx'
import type { TransactionStatus } from '@/types/api'
import styles from './TransactionListRow.module.css'

const STATUS_CLASS: Record<TransactionStatus, string | undefined> = {
  successful: styles.successful,
  pending: styles.pending,
  failed: styles.failed,
}

export function StatusPill({ status }: { status: TransactionStatus }) {
  return (
    <span className={cx(styles.status, STATUS_CLASS[status])}>
      <span className={styles.dot} aria-hidden />
      {TRANSACTION_STATUS_LABELS[status]}
    </span>
  )
}
