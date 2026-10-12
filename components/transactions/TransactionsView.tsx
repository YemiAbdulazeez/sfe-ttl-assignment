'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui'
import {
  hasTransactionFilter,
  isTransactionStatus,
  isTransactionType,
  TRANSACTION_STATUS_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  transactionCountLabel,
  type TransactionListState,
} from '@/lib/transactions/query'
import { FilterMenu } from './FilterMenu'
import { TransactionDetails } from './TransactionDetails'
import {
  TransactionEmpty,
  TransactionError,
  TransactionInlineError,
  TransactionPagination,
  TransactionResultList,
  TransactionSkeleton,
} from './TransactionResults'
import { useMatchMedia } from './useMatchMedia'
import { useTransactionList } from './useTransactionList'
import { useTransactionListState } from './useTransactionListState'
import styles from './TransactionsView.module.css'

type OpenMenu = 'type' | 'status' | null

export function TransactionsView() {
  const { state, commit } = useTransactionListState()
  const { rows, meta, failed, loading, retry } = useTransactionList(state)
  const [searchValue, setSearchValue] = useState(state.q)
  const [syncedQuery, setSyncedQuery] = useState(state.q)
  const [pendingQuery, setPendingQuery] = useState(state.q)
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const stateRef = useRef(state)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const compact = useMatchMedia('(max-width: 640px)')
  const filtered = hasTransactionFilter(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const update = useCallback(
    (next: TransactionListState) => {
      stateRef.current = next
      commit(next)
    },
    [commit]
  )

  if (syncedQuery !== state.q) {
    setSyncedQuery(state.q)
    if (state.q !== pendingQuery) setSearchValue(state.q)
    setPendingQuery(state.q)
  }

  useEffect(() => {
    const trimmed = searchValue.trim()
    if (trimmed === state.q) return
    const timer = window.setTimeout(() => {
      const current = stateRef.current
      if (current.q === trimmed) return
      setPendingQuery(trimmed)
      update({ ...current, q: trimmed, page: 1 })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchValue, state.q, update])

  function commitFilters(next: Partial<TransactionListState>, resetPage: boolean) {
    const current = stateRef.current
    setOpenMenu(null)
    update({ ...current, ...next, page: resetPage ? 1 : (next.page ?? current.page) })
  }

  function clearFilters() {
    setPendingQuery('')
    setSearchValue('')
    setOpenMenu(null)
    update({ ...stateRef.current, q: '', type: undefined, status: undefined, page: 1 })
  }

  const closeDetails = useCallback(() => {
    update({ ...stateRef.current, id: undefined })
  }, [update])

  const detailsOpen = Boolean(state.id)
  const detailsWereOpen = useRef(false)

  useEffect(() => {
    if (detailsOpen) {
      detailsWereOpen.current = true
      return
    }
    if (!detailsWereOpen.current) return
    detailsWereOpen.current = false
    const opener = openerRef.current
    openerRef.current = null
    if (opener?.isConnected) opener.focus()
    else titleRef.current?.focus()
  }, [detailsOpen])

  const showSkeleton = rows === null && !failed
  const showFullError = failed && (rows === null || rows.length === 0)
  const showInlineError = failed && rows !== null && rows.length > 0
  const showEmpty = !failed && rows !== null && rows.length === 0
  const showList = rows !== null && rows.length > 0
  const searchPending = searchValue.trim() !== state.q
  const showSearchSpinner = searchPending || (loading && (state.q !== '' || searchValue.trim() !== ''))

  return (
    <div className={styles.page}>
      <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
        Transactions
      </h1>
      <p className={styles.count}>{meta ? transactionCountLabel(meta.total, filtered) : '\u00a0'}</p>

      <div className={styles.filters}>
        <div className={styles.searchField}>
          <label htmlFor="tx-search">Search</label>
          <div className={styles.searchControl}>
            <Icon name="search" size={16} />
            <input
              id="tx-search"
              type="search"
              value={searchValue}
              placeholder={compact ? 'Search reference, name...' : 'Search by reference, name or narration'}
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            {showSearchSpinner ? <span className={styles.searchSpinner} aria-hidden="true" /> : null}
          </div>
        </div>
        <div className={styles.filterPair}>
          <FilterMenu
            label="Type"
            allLabel="All types"
            options={TRANSACTION_TYPE_OPTIONS}
            value={state.type}
            open={openMenu === 'type'}
            onOpenChange={(open) => setOpenMenu(open ? 'type' : null)}
            onChange={(value) =>
              commitFilters({ type: value && isTransactionType(value) ? value : undefined }, true)
            }
          />
          <FilterMenu
            label="Status"
            allLabel="All statuses"
            options={TRANSACTION_STATUS_OPTIONS}
            value={state.status}
            open={openMenu === 'status'}
            onOpenChange={(open) => setOpenMenu(open ? 'status' : null)}
            onChange={(value) =>
              commitFilters({ status: value && isTransactionStatus(value) ? value : undefined }, true)
            }
          />
        </div>
        {filtered ? (
          <button type="button" className={styles.clear} onClick={clearFilters}>
            Clear filters
          </button>
        ) : null}
      </div>

      <div className={styles.region}>
        {showInlineError ? <TransactionInlineError onRetry={retry} /> : null}
        {showSkeleton ? <TransactionSkeleton /> : null}
        {showFullError ? <TransactionError onRetry={retry} /> : null}
        {showEmpty ? <TransactionEmpty filtered={filtered} onClear={clearFilters} /> : null}
        {showList && rows ? (
          <TransactionResultList
            transactions={rows}
            selectedId={state.id}
            onSelect={(id, opener) => {
              openerRef.current = opener
              if (id !== state.id) update({ ...state, id })
            }}
          />
        ) : null}
        {meta && meta.total > 0 && !showSkeleton && !showFullError ? (
          <TransactionPagination
            page={state.page}
            total={meta.total}
            totalPages={meta.totalPages}
            onPage={(page) => update({ ...state, page })}
          />
        ) : null}
      </div>
      {state.id ? (
        <TransactionDetails
          id={state.id}
          rows={rows}
          listSettled={rows !== null || failed}
          onClose={closeDetails}
        />
      ) : null}
    </div>
  )
}

export function TransactionsPending() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Transactions</h1>
      <p className={styles.count}>{'\u00a0'}</p>
      <div className={styles.region}>
        <TransactionSkeleton />
      </div>
    </div>
  )
}
