import {
  hasTransactionFilter,
  parseTransactionListState,
  serializeTransactionListState,
  toTransactionQuery,
  transactionCountLabel,
} from './query'

describe('parseTransactionListState', () => {
  it('uses defaults when the query is empty', () => {
    expect(parseTransactionListState(new URLSearchParams())).toEqual({
      page: 1,
      q: '',
      type: undefined,
      status: undefined,
      id: undefined,
    })
  })

  it('reads a valid query and trims search text', () => {
    const params = new URLSearchParams('page=3&q=%20netflix%20&type=card_payment&status=pending&id=txn_1')
    expect(parseTransactionListState(params)).toEqual({
      page: 3,
      q: 'netflix',
      type: 'card_payment',
      status: 'pending',
      id: 'txn_1',
    })
  })

  it('drops unknown type and status values and non-positive pages', () => {
    const params = new URLSearchParams('page=0&type=reversed&status=nope&q=')
    expect(parseTransactionListState(params)).toEqual({
      page: 1,
      q: '',
      type: undefined,
      status: undefined,
      id: undefined,
    })
  })
})

describe('serializeTransactionListState', () => {
  it('omits defaults and keeps an existing scenario', () => {
    const query = serializeTransactionListState(
      { page: 1, q: '', type: undefined, status: undefined, id: undefined },
      'error'
    )
    expect(query).toBe('__scenario=error')
  })

  it('writes only the values that differ from the defaults', () => {
    const query = serializeTransactionListState(
      { page: 2, q: 'ada', type: 'transfer_in', status: 'successful', id: 'txn_9' },
      null
    )
    expect(query).toBe('page=2&q=ada&type=transfer_in&status=successful&id=txn_9')
  })
})

describe('toTransactionQuery', () => {
  it('always requests 20 rows and omits an empty search', () => {
    expect(toTransactionQuery({ page: 4, q: '' })).toEqual({
      page: 4,
      limit: 20,
      q: undefined,
      type: undefined,
      status: undefined,
    })
  })
})

describe('transactionCountLabel', () => {
  it('switches between transactions and results', () => {
    expect(transactionCountLabel(1, false)).toBe('1 transaction')
    expect(transactionCountLabel(237, false)).toBe('237 transactions')
    expect(transactionCountLabel(0, true)).toBe('0 results')
    expect(hasTransactionFilter({ page: 1, q: 'a' })).toBe(true)
    expect(hasTransactionFilter({ page: 1, q: '' })).toBe(false)
  })
})
