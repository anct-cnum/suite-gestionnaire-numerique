import { describe, expect, it } from 'vitest'

import { formaterPoidsDeFichier, formatMontantEnMillions } from './number'

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

describe(formaterPoidsDeFichier, () => {
  it.each([
    { attendu: '1,6 Mo', intention: 'en Mo, à une décimale, au-delà d’un million d’octets', octets: 1_638_400 },
    { attendu: '12 Mo', intention: 'en Mo, sans décimale inutile', octets: 12_000_000 },
    { attendu: '1 Mo', intention: 'en Mo plutôt que « 1 000 Ko » quand l’arrondi y mène', octets: 999_600 },
    { attendu: '12 Ko', intention: 'en Ko, arrondi, entre mille octets et un million', octets: 12_345 },
    { attendu: '499 octets', intention: 'en octets en dessous de 500 octets', octets: 499 },
  ])('affiche le poids $intention', ({ attendu, octets }) => {
    expect(formaterPoidsDeFichier(octets)).toBe(attendu)
  })
})
