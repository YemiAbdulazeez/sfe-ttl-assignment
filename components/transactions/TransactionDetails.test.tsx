import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError } from '@/lib/api/client'
import { getTransaction } from '@/lib/api/endpoints'
import { formatDateTime } from '@/lib/format'
import type { Transaction } from '@/types/api'
import { TransactionDetails } from './TransactionDetails'

vi.mock('@/lib/api/endpoints', () => ({
  getTransaction: vi.fn(),
}))

const fetchTransaction = vi.mocked(getTransaction)
const markup = '<img src="x" onerror="alert(1)">'

function transaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'txn_1',
    reference: 'ACM-48213377',
    type: 'transfer_out',
    status: 'successful',
    currency: 'GHS',
    amount: 120000,
    fee: 1200,
    narration: 'Rent for October',
    counterparty: 'Kwame Mensah',
    createdAt: '2026-10-05T10:15:00.000Z',
    ...overrides,
  }
}

function renderDetails(rows: readonly Transaction[] | null, id = 'txn_1', listSettled = true) {
  const onClose = vi.fn()
  render(<TransactionDetails id={id} rows={rows} listSettled={listSettled} onClose={onClose} />)
  return { onClose }
}

describe('TransactionDetails', () => {
  beforeEach(() => {
    fetchTransaction.mockReset()
  })

  it('shows the page row without fetching, and renders narration as text', async () => {
    const row = transaction({
      narration: markup,
      type: 'card_payment',
      counterparty: null,
      currency: 'USD',
      amount: 4599,
      fee: 0,
    })
    renderDetails([row])

    expect(await screen.findByRole('dialog', { name: 'Transaction details' })).toBeInTheDocument()
    expect(fetchTransaction).not.toHaveBeenCalled()
    expect(screen.getAllByText(markup)).toHaveLength(2)
    expect(document.querySelector('img')).toBeNull()
    expect(screen.queryByText('Counterparty')).not.toBeInTheDocument()
    expect(screen.getByText('−$45.99')).toBeInTheDocument()
    expect(screen.getAllByText('$45.99')).toHaveLength(2)
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })

  it('fetches a transaction that is not on the current page and sums the fee', async () => {
    const row = transaction()
    fetchTransaction.mockResolvedValue({ data: row })
    renderDetails([])

    expect(await screen.findByText('Transfer out to Kwame Mensah')).toBeInTheDocument()
    expect(fetchTransaction).toHaveBeenCalledWith(
      'txn_1',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(screen.getByText('GH₵1,200.00')).toBeInTheDocument()
    expect(screen.getByText('GH₵12.00')).toBeInTheDocument()
    expect(screen.getByText('GH₵1,212.00')).toBeInTheDocument()
    expect(screen.getByText('Kwame Mensah')).toBeInTheDocument()
    expect(screen.getByText(formatDateTime(row.createdAt))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
  })

  it('copies the reference and restores the accessible name', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText },
    })
    try {
      renderDetails([transaction()])
      const button = screen.getByRole('button', { name: 'Copy reference' })
      button.click()
      await act(async () => {
        await Promise.resolve()
      })
      expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
      expect(writeText).toHaveBeenCalledWith('ACM-48213377')
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500)
      })
      expect(screen.getByRole('button', { name: 'Copy reference' })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('keeps the copy name when the clipboard rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText },
    })
    renderDetails([transaction()])
    expect(navigator.clipboard.writeText).toBe(writeText)

    screen.getByRole('button', { name: 'Copy reference' }).click()
    await act(async () => {
      await Promise.resolve()
    })
    expect(writeText).toHaveBeenCalledWith('ACM-48213377')
    expect(screen.getByRole('button', { name: 'Copy reference' })).toBeInTheDocument()
  })

  it('treats a 404 as not found and any other failure as a retryable error', async () => {
    const user = userEvent.setup()
    fetchTransaction.mockRejectedValueOnce(new ApiError(404, 'NOT_FOUND', 'gone from the server'))
    const { onClose } = renderDetails([])

    expect(await screen.findByRole('heading', { name: 'Transaction not found' })).toBeInTheDocument()
    expect(screen.queryByText('gone from the server')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back to transactions' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows the details error line and retries the same id', async () => {
    const user = userEvent.setup()
    fetchTransaction.mockRejectedValueOnce(
      new ApiError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.')
    )
    fetchTransaction.mockResolvedValueOnce({ data: transaction() })
    renderDetails([])

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load your transactions.")
    expect(screen.queryByText('Something went wrong. Please try again.')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('ACM-48213377')).toBeInTheDocument()
    expect(fetchTransaction).toHaveBeenCalledTimes(2)
  })

  it('closes from Escape and the overlay, and keeps a panel click open', async () => {
    const user = userEvent.setup()
    const { onClose } = renderDetails([transaction()])
    const dialog = await screen.findByRole('dialog')

    await user.click(dialog)
    expect(onClose).not.toHaveBeenCalled()

    await user.click(dialog.parentElement!)
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('keeps Tab inside the dialog', async () => {
    const user = userEvent.setup()
    renderDetails([transaction()])
    const close = await screen.findByRole('button', { name: 'Close' })
    const copy = screen.getByRole('button', { name: 'Copy reference' })

    expect(close).toHaveFocus()
    await user.tab()
    expect(copy).toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()
    await user.tab({ shift: true })
    expect(copy).toHaveFocus()
  })

  it('waits for the list before fetching', () => {
    renderDetails(null, 'txn_1', false)
    expect(screen.getByText('Loading transaction')).toBeInTheDocument()
    expect(fetchTransaction).not.toHaveBeenCalled()
  })
})
