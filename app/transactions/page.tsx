import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TransactionsPending, TransactionsView } from '@/components/transactions/TransactionsView'

export const metadata: Metadata = {
  title: 'Transactions',
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsPending />}>
      <TransactionsView />
    </Suspense>
  )
}
