import type { TransactionStatus, TransactionType } from '@/types/api'
import type { TransactionQuery } from '@/lib/api/endpoints'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'

export const TRANSACTION_PAGE_LIMIT = 20

export const TRANSACTION_TYPE_ORDER = [
  'deposit',
  'withdrawal',
  'transfer_in',
  'transfer_out',
  'conversion',
  'card_payment',
  'bill_payment',
] as const satisfies readonly TransactionType[]

export const TRANSACTION_STATUS_ORDER = [
  'successful',
  'pending',
  'failed',
] as const satisfies readonly TransactionStatus[]

export const TRANSACTION_TYPE_OPTIONS = TRANSACTION_TYPE_ORDER.map((value) => ({
  value,
  label: TRANSACTION_TYPE_LABELS[value],
}))

export const TRANSACTION_STATUS_OPTIONS = TRANSACTION_STATUS_ORDER.map((value) => ({
  value,
  label: TRANSACTION_STATUS_LABELS[value],
}))

const TYPE_VALUES = new Set<string>(TRANSACTION_TYPE_ORDER)
const STATUS_VALUES = new Set<string>(TRANSACTION_STATUS_ORDER)

export function isTransactionType(value: string): value is TransactionType {
  return TYPE_VALUES.has(value)
}

export function isTransactionStatus(value: string): value is TransactionStatus {
  return STATUS_VALUES.has(value)
}

export interface TransactionListState {
  page: number
  q: string
  type?: TransactionType
  status?: TransactionStatus
  id?: string
}

export function hasTransactionFilter(state: TransactionListState): boolean {
  return state.q !== '' || state.type !== undefined || state.status !== undefined
}

export function transactionCountLabel(total: number, filtered: boolean): string {
  if (filtered) return `${total} results`
  if (total === 1) return '1 transaction'
  return `${total} transactions`
}

function parsePage(value: string | null): number {
  if (!value || !/^[1-9]\d*$/.test(value)) return 1
  const page = Number(value)
  return Number.isSafeInteger(page) ? page : 1
}

function readParam(params: Pick<URLSearchParams, 'get'>, key: string): string | null {
  return params.get(key)
}

export function parseTransactionListState(params: Pick<URLSearchParams, 'get'>): TransactionListState {
  const type = readParam(params, 'type')
  const status = readParam(params, 'status')
  const id = readParam(params, 'id')?.trim()

  return {
    page: parsePage(readParam(params, 'page')),
    q: readParam(params, 'q')?.trim() ?? '',
    type: type && TYPE_VALUES.has(type) ? (type as TransactionType) : undefined,
    status: status && STATUS_VALUES.has(status) ? (status as TransactionStatus) : undefined,
    id: id ? id : undefined,
  }
}

/** Omits defaults. Keeps `__scenario` only when the page URL already has it. */
export function serializeTransactionListState(state: TransactionListState, scenario: string | null): string {
  const params = new URLSearchParams()
  if (state.page > 1) params.set('page', String(state.page))
  if (state.q) params.set('q', state.q)
  if (state.type) params.set('type', state.type)
  if (state.status) params.set('status', state.status)
  if (state.id) params.set('id', state.id)
  if (scenario) params.set('__scenario', scenario)
  return params.toString()
}

export function toTransactionQuery(state: TransactionListState): TransactionQuery {
  return {
    page: state.page,
    limit: TRANSACTION_PAGE_LIMIT,
    q: state.q || undefined,
    type: state.type,
    status: state.status,
  }
}
