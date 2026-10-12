import { describe, expect, it } from 'vitest'
import { detailHeroLine, detailSummary } from './details'

describe('detailHeroLine', () => {
  it('names the counterparty on transfers', () => {
    expect(detailHeroLine({ type: 'transfer_out', counterparty: 'Kwame Mensah', narration: 'Rent' })).toBe(
      'Transfer out to Kwame Mensah'
    )
    expect(detailHeroLine({ type: 'transfer_in', counterparty: 'Ada Okafor', narration: 'Salary' })).toBe(
      'Transfer in from Ada Okafor'
    )
  })

  it('uses the narration as text for every other type, including markup', () => {
    const narration = '<img src="x" onerror="alert(1)">'
    expect(detailHeroLine({ type: 'card_payment', counterparty: 'Netflix', narration })).toBe(narration)
    expect(detailHeroLine({ type: 'transfer_out', counterparty: null, narration })).toBe(narration)
  })
})

describe('detailSummary', () => {
  it('adds the fee in minor units and keeps a zero fee', () => {
    expect(detailSummary(120000, 1200, 'GHS')).toEqual({
      amount: 'GH₵1,200.00',
      fee: 'GH₵12.00',
      total: 'GH₵1,212.00',
    })
    expect(detailSummary(4599, 0, 'USD')).toEqual({
      amount: '$45.99',
      fee: '$0.00',
      total: '$45.99',
    })
  })
})
