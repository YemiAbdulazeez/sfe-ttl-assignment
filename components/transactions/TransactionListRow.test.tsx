import { render, screen } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { TransactionListRow } from './TransactionListRow'

const markup = '<img src="x" onerror="alert(1)">'

const transaction: Transaction = {
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'card_payment',
  status: 'successful',
  currency: 'USD',
  amount: 4599,
  fee: 0,
  narration: markup,
  counterparty: null,
  createdAt: '2026-10-05T10:15:00.000Z',
}

describe('TransactionListRow', () => {
  it('renders narration that contains markup as text', () => {
    const { container } = render(
      <TransactionListRow transaction={transaction} selected={false} onSelect={() => {}} />
    )

    expect(screen.getByText(markup)).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('−$45.99')).toBeInTheDocument()
  })
})
