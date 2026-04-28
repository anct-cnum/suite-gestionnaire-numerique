import { describe, expect, it } from 'vitest'

import { formatMontantEnMillions } from './number'

describe(formatMontantEnMillions, () => {
  it('affiche en M€ pour un montant >= 1 000 000', () => {
    expect(formatMontantEnMillions(1_500_000)).toBe('1,50 M€')
  })

  it('affiche en M€ pour un montant exactement égal à 1 000 000', () => {
    expect(formatMontantEnMillions(1_000_000)).toBe('1,00 M€')
  })

  it('affiche en K€ pour un montant >= 10 000 et < 1 000 000', () => {
    expect(formatMontantEnMillions(500_000)).toBe('500,00 K€')
  })

  it('affiche en K€ pour un montant exactement égal à 10 000', () => {
    expect(formatMontantEnMillions(10_000)).toBe('10,00 K€')
  })

  it('affiche en € pour un montant < 10 000', () => {
    expect(formatMontantEnMillions(9_999)).toBe('9\u202f999 €')
  })

  it('affiche en € pour 0', () => {
    expect(formatMontantEnMillions(0)).toBe('0 €')
  })
})
