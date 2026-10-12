import { formatSignedAmount } from './signed-amount'

describe('formatSignedAmount', () => {
  it('prefixes credits and colours them as credit', () => {
    expect(formatSignedAmount('deposit', 2500000, 'NGN')).toEqual({
      text: '+₦25,000.00',
      tone: 'credit',
    })
    expect(formatSignedAmount('transfer_in', 2500000, 'NGN').tone).toBe('credit')
  })

  it('prefixes debits with a minus and leaves them neutral', () => {
    const debit = formatSignedAmount('card_payment', 1549, 'USD')
    expect(debit).toEqual({ text: '−$15.49', tone: 'neutral' })
    expect(debit.text.startsWith('\u2212')).toBe(true)
    expect(formatSignedAmount('withdrawal', 120000, 'GHS').text).toBe('−GH₵1,200.00')
    expect(formatSignedAmount('bill_payment', 4599, 'USD').text).toBe('−$45.99')
  })

  it('leaves conversions unsigned', () => {
    expect(formatSignedAmount('conversion', 120000, 'GHS')).toEqual({
      text: 'GH₵1,200.00',
      tone: 'neutral',
    })
  })

  it('keeps a very large credit on one unspaced amount', () => {
    expect(formatSignedAmount('deposit', 249999999999, 'NGN').text).toBe('+₦2,499,999,999.99')
  })
})
