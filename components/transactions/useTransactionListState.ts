'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  parseTransactionListState,
  serializeTransactionListState,
  type TransactionListState,
} from '@/lib/transactions/query'

export function useTransactionListState() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const scenario = searchParams.get('__scenario')
  const state = useMemo(() => parseTransactionListState(searchParams), [searchParams])

  const commit = useCallback(
    (next: TransactionListState) => {
      const query = serializeTransactionListState(next, scenario)
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, scenario]
  )

  return { state, commit }
}
