'use client'

import { useEffect, useState } from 'react'
import type { PageMeta, Transaction } from '@/types/api'
import { getTransactions } from '@/lib/api/endpoints'
import { toTransactionQuery, type TransactionListState } from '@/lib/transactions/query'

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function useTransactionList(state: TransactionListState) {
  const [rows, setRows] = useState<Transaction[] | null>(null)
  const [meta, setMeta] = useState<PageMeta | null>(null)
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const { page, q, type, status } = state
  const requestKey = `${page}\0${q}\0${type ?? ''}\0${status ?? ''}\0${attempt}`
  const [trackedKey, setTrackedKey] = useState(requestKey)
  if (trackedKey !== requestKey) {
    setTrackedKey(requestKey)
    setFailed(false)
    setLoading(true)
  }

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    getTransactions(toTransactionQuery({ page, q, type, status }), { signal: controller.signal })
      .then((res) => {
        if (ignore) return
        if (!res.meta) {
          setFailed(true)
          setLoading(false)
          return
        }
        setRows(res.data)
        setMeta(res.meta)
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (ignore || isAbortError(error)) return
        setFailed(true)
        setLoading(false)
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [page, q, type, status, attempt])

  return {
    rows,
    meta,
    failed,
    loading,
    retry: () => setAttempt((value) => value + 1),
  }
}
