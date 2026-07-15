import { describe, expect, it } from 'vitest'
import { calculateAge, formatAge } from './age'

describe('calculateAge', () => {
  it('calculates Clara’s age for Yosemite before her birthday', () => {
    expect(calculateAge('2017-08-01', '2024-07-15')).toEqual({ years: 6, months: 11 })
    expect(formatAge('2017-08-01', '2024-07-15')).toBe('Age 6')
  })

  it('calculates age 7 for Lapland and Corfu', () => {
    expect(calculateAge('2017-08-01', '2024-12-15').years).toBe(7)
    expect(calculateAge('2017-08-01', '2025-07-15').years).toBe(7)
  })

  it('rejects dates before birth', () => {
    expect(() => calculateAge('2017-08-01', '2010-01-01')).toThrow()
  })
})
