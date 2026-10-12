'use client'

import { useEffect, useState } from 'react'
import { ApiError } from '@/lib/api/client'
import { getTransaction } from '@/lib/api/endpoints'
import type { Transaction } from '@/types/api'

export type DetailPhase = 'loading' | 'ready' | 'missing' | 'error'

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

/**
 * Uses the row already on the current page when it is there.
 * Fetches `GET /api/transactions/{id}` only after the list has settled and the row is absent.
 */
export function useTransactionDetails(id: string, rows: readonly Transaction[] | null, listSettled: boolean) {
  const cached = rows?.find((row) => row.id === id)
  const shouldFetch = listSettled && !cached
  const [attempt, setAttempt] = useState(0)
  const [fetched, setFetched] = useState<Transaction | null>(null)
  const [fetchedFor, setFetchedFor] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'missing' | 'error'>('idle')
  const requestKey = shouldFetch ? `${id}:${attempt}` : ''
  const [trackedKey, setTrackedKey] = useState(requestKey)

  if (trackedKey !== requestKey) {
    setTrackedKey(requestKey)
    setStatus(requestKey ? 'loading' : 'idle')
    setFetched(null)
    setFetchedFor(null)
  }

  useEffect(() => {
    if (!shouldFetch) return
    const controller = new AbortController()
    let ignore = false

    getTransaction(id, { signal: controller.signal })
      .then((res) => {
        if (ignore) return
        if (!res.data) {
          setFetched(null)
          setFetchedFor(null)
          setStatus('missing')
          return
        }
        setFetched(res.data)
        setFetchedFor(id)
        setStatus('idle')
      })
      .catch((error: unknown) => {
        if (ignore || isAbortError(error)) return
        setFetched(null)
        setFetchedFor(null)
        setStatus(error instanceof ApiError && error.status === 404 ? 'missing' : 'error')
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [id, shouldFetch, attempt])

  const transaction = cached ?? (fetchedFor === id ? fetched : null)
  const phase: DetailPhase = transaction
    ? 'ready'
    : status === 'missing'
      ? 'missing'
      : status === 'error'
        ? 'error'
        : 'loading'

  return {
    transaction,
    phase,
    retry: () => setAttempt((value) => value + 1),
  }
}
