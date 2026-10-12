import type { ReactNode } from 'react'
import type { Transaction } from '@/types/api'
import { Icon } from '@/components/ui'
import { groupTransactions } from '@/lib/transactions/group'
import { PAGE_ELLIPSIS, paginationItems, showingLabel } from '@/lib/transactions/pagination'
import { TRANSACTION_PAGE_LIMIT } from '@/lib/transactions/query'
import { TransactionListRow } from './TransactionListRow'
import styles from './TransactionResults.module.css'

export function TransactionSkeleton() {
  return (
    <div className={`${styles.card} ${styles.skeleton}`} aria-busy="true">
      <p className="visually-hidden" aria-live="polite">
        Loading transactions
      </p>
      <div className={styles.groupSkeleton}>
        <span className={styles.groupBar} />
      </div>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className={styles.skeletonRow}>
          <span className={styles.skeletonCircle} />
          <span className={styles.skeletonCopy}>
            <span className={styles.skeletonTitle} />
            <span className={styles.skeletonNarration} />
          </span>
          <span className={styles.skeletonMoney}>
            <span className={styles.skeletonAmount} />
            <span className={styles.skeletonDate} />
          </span>
        </div>
      ))}
    </div>
  )
}

export function TransactionInlineError({ onRetry }: { onRetry: () => void }) {
  return (
    <p className={styles.inlineError} role="status">
      We couldn&apos;t load your transactions.{' '}
      <button type="button" className={styles.textButton} onClick={onRetry}>
        Try again
      </button>
    </p>
  )
}

export function TransactionEmpty({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  if (filtered) {
    return (
      <StateCard>
        <span className={styles.iconWell}>
          <Icon name="search" size={24} />
        </span>
        <h2 className={styles.stateTitle}>No transactions match your filters</h2>
        <p className={styles.stateBody}>Try a different search term or remove filters.</p>
        <button type="button" className={styles.outlineButton} onClick={onClear}>
          Clear filters
        </button>
      </StateCard>
    )
  }

  return (
    <StateCard>
      <span className={styles.iconWell}>
        <Icon name="wallet" size={24} />
      </span>
      <h2 className={styles.stateTitle}>No transactions yet</h2>
      <p className={styles.stateBody}>
        When you add money, send a transfer or pay with your card, it will show up here.
      </p>
    </StateCard>
  )
}

export function TransactionError({ onRetry }: { onRetry: () => void }) {
  return (
    <StateCard>
      <span className={styles.errorWell}>
        <Icon name="alert" size={24} />
      </span>
      <h2 className={styles.stateTitle}>We couldn&apos;t load your transactions</h2>
      <p className={styles.stateBody}>Check your connection and try again.</p>
      <button type="button" className={styles.primaryButton} onClick={onRetry}>
        <Icon name="refresh" size={16} />
        Try again
      </button>
    </StateCard>
  )
}

function StateCard({ children }: { children: ReactNode }) {
  return <div className={styles.stateCard}>{children}</div>
}

export function TransactionResultList({
  transactions,
  selectedId,
  onSelect,
}: {
  transactions: readonly Transaction[]
  selectedId?: string
  onSelect: (id: string, opener: HTMLButtonElement) => void
}) {
  const groups = groupTransactions(transactions)

  return (
    <section className={styles.card} aria-label="Transactions">
      {groups.map((group) => (
        <div key={`${group.label}-${group.transactions[0]?.id ?? group.label}`} className={styles.groupBlock}>
          <h2 className={styles.group}>{group.label}</h2>
          <div className={styles.rows}>
            {group.transactions.map((transaction) => (
              <TransactionListRow
                key={transaction.id}
                transaction={transaction}
                selected={transaction.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

export function TransactionPagination({
  page,
  total,
  totalPages,
  onPage,
}: {
  page: number
  total: number
  totalPages: number
  onPage: (page: number) => void
}) {
  const items = paginationItems(page, totalPages)

  return (
    <>
      <nav className={styles.pager} aria-label="Pagination">
        <p>{showingLabel(page, TRANSACTION_PAGE_LIMIT, total)}</p>
        <div className={styles.pagerControls}>
          <button type="button" className={styles.step} disabled={page <= 1} onClick={() => onPage(page - 1)}>
            {'< Previous'}
          </button>
          {items.map((item, index) =>
            item === PAGE_ELLIPSIS ? (
              <span key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden>
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={styles.pageNumber}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPage(item)}
              >
                {item}
              </button>
            )
          )}
          <button
            type="button"
            className={styles.step}
            disabled={page >= totalPages}
            onClick={() => onPage(page + 1)}
          >
            {'Next >'}
          </button>
        </div>
      </nav>
      <nav className={styles.mobilePager} aria-label="Pagination">
        <button
          type="button"
          className={styles.mobileStep}
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Prev
        </button>
        <p className={styles.mobilePage}>
          Page {page} of {totalPages}
        </p>
        <button
          type="button"
          className={styles.mobileStep}
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          Next
          <Icon name="chevron-right" size={16} />
        </button>
      </nav>
    </>
  )
}
