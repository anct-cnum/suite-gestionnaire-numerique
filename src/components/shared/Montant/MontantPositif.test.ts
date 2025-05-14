import { describe, expect, it } from 'vitest'

import { MontantPositif } from './MontantPositif'
import { Optional } from '@/shared/Optional'

describe('montantPositif', () => {
  // --- Création ---
  it('montantPositif.Zero retourne un montantPositif de 0', () => {
    expect(MontantPositif.Zero.get).toBe(0)
  })

  it('montantPositif.of crée un montantPositif valide', () => {
    const montantValide = MontantPositif.of('100')
    expect(montantValide.isPresent()).toBe(true)
    expect(montantValide.orElse(MontantPositif.Zero).get).toBe(100)
  })

  it('montantPositif.of retourne Optional.empty pour une valeur négative', () => {
    const montantNegatif = MontantPositif.of('-1')
    expect(montantNegatif.isEmpty()).toBe(true)
  })

  it('montantPositif.of retourne Optional.empty pour une chaîne non numérique', () => {
    const montantInvalide = MontantPositif.of('abc')
    expect(montantInvalide.isEmpty()).toBe(true)
  })

  it('montantPositif.of retourne Optional.empty pour une valeur à virgule', () => {
    const montantDecimal = MontantPositif.of('12.5')
    expect(montantDecimal.isEmpty()).toBe(true)
  })

  it('montantPositif.of limite à Number.MAX_SAFE_INTEGER', () => {
    const montantExcessif = MontantPositif.of(`${Number.MAX_SAFE_INTEGER + 100}`)
    expect(montantExcessif.isPresent()).toBe(true)
    expect(montantExcessif.orElse(MontantPositif.Zero).get).toBe(Number.MAX_SAFE_INTEGER)
  })

  // --- Méthode add() ---
  it('add additionne deux montants', () => {
    const montantInitial = MontantPositif.of('50').orElse(MontantPositif.Zero)
    const montantAjoute = MontantPositif.of('20')
    const somme = montantInitial.add(montantAjoute)
    expect(somme.orElse(MontantPositif.Zero).get).toBe(70)
  })

  it('add avec Optional.empty ajoute 0', () => {
    const montantInitial = MontantPositif.of('30').orElse(MontantPositif.Zero)
    const somme = montantInitial.add(Optional.empty())
    expect(somme.orElse(MontantPositif.Zero).get).toBe(30)
  })

  // --- Méthode subtract() ---
  it('subtract retourne la différence correcte', () => {
    const montantDeBase = MontantPositif.of('80').orElse(MontantPositif.Zero)
    const montantASoustraire = MontantPositif.of('50')
    const difference = montantDeBase.subtract(montantASoustraire)
    expect(difference.orElse(MontantPositif.Zero).get).toBe(30)
  })

  it('subtract retourne Optional.empty si le résultat est négatif', () => {
    const petitMontant = MontantPositif.of('10').orElse(MontantPositif.Zero)
    const grandMontant = MontantPositif.of('50')
    const resultat = petitMontant.subtract(grandMontant)
    expect(resultat.isEmpty()).toBe(true)
  })

  it('subtract avec Optional.empty ne change pas le montantPositif', () => {
    const montantOriginal = MontantPositif.of('40').orElse(MontantPositif.Zero)
    const resultat = montantOriginal.subtract(Optional.empty())
    expect(resultat.orElse(MontantPositif.Zero).get).toBe(40)
  })

  // --- Méthode equals() ---
  it('equals retourne true pour deux montants égaux', () => {
    const montant1 = MontantPositif.of('42').orElse(MontantPositif.Zero)
    const montant2 = MontantPositif.of('42')
    expect(montant1.equals(montant2)).toBe(true)
  })

  it('equals retourne false pour des montants différents', () => {
    const montant1 = MontantPositif.of('42').orElse(MontantPositif.Zero)
    const montant2 = MontantPositif.of('99')
    expect(montant1.equals(montant2)).toBe(false)
  })

  it('equals compare à 0 si Optional est vide', () => {
    const montantPositif = MontantPositif.of('0').orElse(MontantPositif.Zero)
    expect(montantPositif.equals(Optional.empty())).toBe(true)
  })

  // --- Méthode greaterThan() ---
  it('greaterThan retourne true si supérieur', () => {
    const montantPlusGrand = MontantPositif.of('100').orElse(MontantPositif.Zero)
    const montantPlusPetit = MontantPositif.of('40')
    expect(montantPlusGrand.greaterThan(montantPlusPetit)).toBe(true)
  })

  it('greaterThan retourne false si égal ou inférieur', () => {
    const montant1 = MontantPositif.of('30').orElse(MontantPositif.Zero)
    const montant2 = MontantPositif.of('30')
    expect(montant1.greaterThan(montant2)).toBe(false)
  })

  it('greaterThan retourne true si comparé à Optional.empty', () => {
    const montantPositif = MontantPositif.of('5').orElse(MontantPositif.Zero)
    expect(montantPositif.greaterThan(Optional.empty())).toBe(true)
  })

  // --- Méthode lessThan() ---
  it('lessThan retourne true si inférieur', () => {
    const montantPetit = MontantPositif.of('5').orElse(MontantPositif.Zero)
    const montantGrand = MontantPositif.of('10')
    expect(montantPetit.lessThan(montantGrand)).toBe(true)
  })

  it('lessThan retourne false si égal ou supérieur', () => {
    const montant1 = MontantPositif.of('50').orElse(MontantPositif.Zero)
    const montant2 = MontantPositif.of('50')
    expect(montant1.lessThan(montant2)).toBe(false)
  })

  it('lessThan retourne false si comparé à Optional.empty', () => {
    const montantPositif = MontantPositif.of('0').orElse(MontantPositif.Zero)
    expect(montantPositif.lessThan(Optional.empty())).toBe(false)
  })

  // --- Méthode format() ---
  it('format retourne une string sans séparateurs ni décimales', () => {
    const montantPositif = MontantPositif.of('123456').orElse(MontantPositif.Zero)
    expect(montantPositif.format()).toBe('123\u202f456')
  })

  it('format retourne "0" pour montantPositif.Zero', () => {
    expect(MontantPositif.Zero.format()).toBe('0')
  })
})
