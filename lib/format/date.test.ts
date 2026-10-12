import { formatGroupLabel, formatTime } from './date'

describe('formatGroupLabel', () => {
  it('labels the viewer’s local today and yesterday', () => {
    const today = new Date(2026, 9, 6, 15, 0, 0)
    const yesterday = new Date(2026, 9, 5, 23, 30, 0)
    expect(formatGroupLabel(today.toISOString(), today)).toBe('TODAY')
    expect(formatGroupLabel(yesterday.toISOString(), today)).toBe('YESTERDAY')
  })

  it('uppercases any other local calendar day', () => {
    const iso = '2026-10-05T10:15:00.000Z'
    const now = new Date(2026, 0, 1, 12, 0, 0)
    const expected = new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
      .format(new Date(iso))
      .toUpperCase()
    expect(formatGroupLabel(iso, now)).toBe(expected)
  })

  it('formats the worked example in a UTC+1 zone', () => {
    const iso = '2026-10-05T10:15:00.000Z'
    if (new Date(iso).getTimezoneOffset() !== -60) return
    expect(formatGroupLabel(iso, new Date(2026, 9, 12, 12, 0, 0))).toBe('MON, 5 OCT 2026')
  })
})

describe('formatTime', () => {
  it('uses a 24-hour clock', () => {
    const iso = '2026-09-30T14:22:00.000Z'
    expect(formatTime(iso)).toBe(
      new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(new Date(iso))
    )
    expect(formatTime(iso)).toMatch(/^\d{2}:\d{2}$/)
  })
})
