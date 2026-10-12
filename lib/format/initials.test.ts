import { counterpartyInitials } from './initials'

describe('counterpartyInitials', () => {
  it('uses the first letter of the first two words', () => {
    expect(counterpartyInitials('Kwame Mensah')).toBe('KM')
    expect(counterpartyInitials('Ada Okafor')).toBe('AO')
  })

  it('uses the first two letters of a single word', () => {
    expect(counterpartyInitials('Ada')).toBe('AD')
  })

  it('ignores words after the second', () => {
    expect(counterpartyInitials('Okonkwo-Adeyemi Logistics & Haulage International Ltd')).toBe('OL')
  })

  it('returns null when there is no name', () => {
    expect(counterpartyInitials(null)).toBeNull()
    expect(counterpartyInitials(undefined)).toBeNull()
    expect(counterpartyInitials('   ')).toBeNull()
  })
})
