'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@/components/ui'
import { formatDateTime, formatSignedAmount, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { detailHeroLine, detailSummary } from '@/lib/transactions/details'
import type { Transaction } from '@/types/api'
import { cx } from '@/lib/cx'
import { StatusPill } from './StatusPill'
import { transactionMark } from './transactionMark'
import { useTransactionDetails, type DetailPhase } from './useTransactionDetails'
import styles from './TransactionDetails.module.css'

const TITLE_ID = 'transaction-details-title'

function subscribeNothing() {
  return () => {}
}

function isClientSnapshot() {
  return true
}

function isServerSnapshot() {
  return false
}

function tabbable(root: HTMLElement): HTMLElement[] {
  const nodes = root.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea')
  return [...nodes].filter((node) => !node.hasAttribute('disabled') && node.tabIndex >= 0)
}

function useDialogLifecycle(onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const items = tabbable(panel)
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) {
        event.preventDefault()
        return
      }
      const active = document.activeElement
      const inside = active instanceof Node && panel.contains(active)
      if (!inside) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return { panelRef, closeRef }
}

function HeroMark({ transaction }: { transaction: Transaction }) {
  const mark = transactionMark(transaction)
  if ('initials' in mark) return <span className={styles.heroMark}>{mark.initials}</span>
  return (
    <span className={styles.heroMark}>
      <Icon name={mark.icon} size={18} />
    </span>
  )
}

function CopyReference({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  function copy() {
    try {
      navigator.clipboard.writeText(value).then(
        () => {
          setCopied(true)
          if (timerRef.current !== null) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => setCopied(false), 1500)
        },
        () => setCopied(false)
      )
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      className={cx(styles.copy, copied && styles.copied)}
      aria-label={copied ? 'Copied' : 'Copy reference'}
      onClick={copy}
    >
      {copied ? 'Copied' : <Icon name="copy" size={14} />}
    </button>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function DetailBody({ transaction }: { transaction: Transaction }) {
  const signed = formatSignedAmount(transaction.type, transaction.amount, transaction.currency)
  const summary = detailSummary(transaction.amount, transaction.fee, transaction.currency)

  return (
    <>
      <div className={styles.hero}>
        <HeroMark transaction={transaction} />
        <p className={styles.heroLine}>{detailHeroLine(transaction)}</p>
        <p className={cx(styles.heroAmount, signed.tone === 'credit' && styles.credit)}>{signed.text}</p>
        <div className={styles.heroPill}>
          <StatusPill status={transaction.status} />
        </div>
      </div>

      <section className={styles.section}>
        <h3 className={styles.kicker}>Details</h3>
        <dl>
          <Field label="Reference">
            <span>{transaction.reference}</span>
            <CopyReference value={transaction.reference} />
          </Field>
          <Field label="Date">{formatDateTime(transaction.createdAt)}</Field>
          <Field label="Type">{TRANSACTION_TYPE_LABELS[transaction.type]}</Field>
          {transaction.counterparty ? <Field label="Counterparty">{transaction.counterparty}</Field> : null}
          <Field label="Narration">{transaction.narration}</Field>
        </dl>
      </section>

      <section className={styles.summary}>
        <h3 className={styles.kicker}>Summary</h3>
        <dl>
          <Field label="Amount">{summary.amount}</Field>
          <Field label="Fee">{summary.fee}</Field>
          <div className={cx(styles.field, styles.total)}>
            <dt>Total</dt>
            <dd>{summary.total}</dd>
          </div>
        </dl>
      </section>
    </>
  )
}

function DetailSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true">
      <p className="visually-hidden">Loading transaction</p>
      <span className={styles.skCircle} />
      <span className={styles.skLine} />
      <span className={styles.skAmount} />
      <span className={styles.skPill} />
      <div className={styles.skRows}>
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} className={styles.skPair}>
            <span className={styles.skLabel} />
            <span className={styles.skValue} />
          </span>
        ))}
      </div>
    </div>
  )
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className={styles.notice}>
      <span className={styles.noticeIcon}>
        <Icon name="search" size={24} />
      </span>
      <h3 className={styles.noticeTitle}>Transaction not found</h3>
      <p className={styles.noticeBody}>It may have been removed, or the link is wrong.</p>
      <button type="button" className={styles.outlineButton} onClick={onBack}>
        Back to transactions
      </button>
    </div>
  )
}

function DetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <p className={styles.detailError} role="alert">
      We couldn&apos;t load your transactions.{' '}
      <button type="button" className={styles.retry} onClick={onRetry}>
        Try again
      </button>
    </p>
  )
}

function panelBody(
  phase: DetailPhase,
  transaction: Transaction | null,
  onClose: () => void,
  onRetry: () => void
) {
  if (phase === 'ready' && transaction) return <DetailBody transaction={transaction} />
  if (phase === 'missing') return <NotFound onBack={onClose} />
  if (phase === 'error') return <DetailError onRetry={onRetry} />
  return <DetailSkeleton />
}

export function TransactionDetails({
  id,
  rows,
  listSettled,
  onClose,
}: {
  id: string
  rows: readonly Transaction[] | null
  listSettled: boolean
  onClose: () => void
}) {
  const { transaction, phase, retry } = useTransactionDetails(id, rows, listSettled)
  const { panelRef, closeRef } = useDialogLifecycle(onClose)
  const isClient = useSyncExternalStore(subscribeNothing, isClientSnapshot, isServerSnapshot)

  useEffect(() => {
    if (!isClient) return
    closeRef.current?.focus()
  }, [id, isClient, closeRef])

  if (!isClient) return null

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden="true" />
        <header className={styles.header}>
          <h2 id={TITLE_ID} className={styles.heading}>
            Transaction details
          </h2>
          <button ref={closeRef} type="button" className={styles.close} aria-label="Close" onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </header>
        <div className={styles.body}>{panelBody(phase, transaction, onClose, retry)}</div>
      </div>
    </div>,
    document.body
  )
}
