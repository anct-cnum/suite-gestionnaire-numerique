import { describe, expect, it } from 'vitest'

import { Montant } from './Montant'
import { Optional } from '@/shared/Optional'

describe('montant', () => {
  // --- Création ---
  it('montant.Zero retourne un montant de 0', () => {
    expect(Montant.Zero.get).toBe(0)
  })

  it('montant.of crée un montant valide', () => {
    const montantValide = Montant.of('100')
    expect(montantValide.isPresent()).toBe(true)
    expect(montantValide.orElse(Montant.Zero).get).toBe(100)
  })

  it('montant.of retourne Optional.empty pour une valeur négative', () => {
    const montantNegatif = Montant.of('-1')
    expect(montantNegatif.isEmpty()).toBe(true)
  })

  it('montant.of retourne Optional.empty pour une chaîne non numérique', () => {
    const montantInvalide = Montant.of('abc')
    expect(montantInvalide.isEmpty()).toBe(true)
  })

  it('montant.of retourne Optional.empty pour une valeur à virgule', () => {
    const montantDecimal = Montant.of('12.5')
    expect(montantDecimal.isEmpty()).toBe(true)
  })

  it('montant.of limite à Number.MAX_SAFE_INTEGER', () => {
    const montantExcessif = Montant.of(`${Number.MAX_SAFE_INTEGER + 100}`)
    expect(montantExcessif.isPresent()).toBe(true)
    expect(montantExcessif.orElse(Montant.Zero).get).toBe(Number.MAX_SAFE_INTEGER)
  })

  // --- Méthode add() ---
  it('add additionne deux montants', () => {
    const montantInitial = Montant.of('50').orElse(Montant.Zero)
    const montantAjoute = Montant.of('20')
    const somme = montantInitial.add(montantAjoute)
    expect(somme.orElse(Montant.Zero).get).toBe(70)
  })

  it('add avec Optional.empty ajoute 0', () => {
    const montantInitial = Montant.of('30').orElse(Montant.Zero)
    const somme = montantInitial.add(Optional.empty())
    expect(somme.orElse(Montant.Zero).get).toBe(30)
  })

  // --- Méthode subtract() ---
  it('subtract retourne la différence correcte', () => {
    const montantDeBase = Montant.of('80').orElse(Montant.Zero)
    const montantASoustraire = Montant.of('50')
    const difference = montantDeBase.subtract(montantASoustraire)
    expect(difference.orElse(Montant.Zero).get).toBe(30)
  })

  it('subtract retourne Optional.empty si le résultat est négatif', () => {
    const petitMontant = Montant.of('10').orElse(Montant.Zero)
    const grandMontant = Montant.of('50')
    const resultat = petitMontant.subtract(grandMontant)
    expect(resultat.isEmpty()).toBe(true)
  })

  it('subtract avec Optional.empty ne change pas le montant', () => {
    const montantOriginal = Montant.of('40').orElse(Montant.Zero)
    const resultat = montantOriginal.subtract(Optional.empty())
    expect(resultat.orElse(Montant.Zero).get).toBe(40)
  })

  // --- Méthode equals() ---
  it('equals retourne true pour deux montants égaux', () => {
    const montant1 = Montant.of('42').orElse(Montant.Zero)
    const montant2 = Montant.of('42')
    expect(montant1.equals(montant2)).toBe(true)
  })

  it('equals retourne false pour des montants différents', () => {
    const montant1 = Montant.of('42').orElse(Montant.Zero)
    const montant2 = Montant.of('99')
    expect(montant1.equals(montant2)).toBe(false)
  })

  it('equals compare à 0 si Optional est vide', () => {
    const montant = Montant.of('0').orElse(Montant.Zero)
    expect(montant.equals(Optional.empty())).toBe(true)
  })

  // --- Méthode greaterThan() ---
  it('greaterThan retourne true si supérieur', () => {
    const montantPlusGrand = Montant.of('100').orElse(Montant.Zero)
    const montantPlusPetit = Montant.of('40')
    expect(montantPlusGrand.greaterThan(montantPlusPetit)).toBe(true)
  })

  it('greaterThan retourne false si égal ou inférieur', () => {
    const montant1 = Montant.of('30').orElse(Montant.Zero)
    const montant2 = Montant.of('30')
    expect(montant1.greaterThan(montant2)).toBe(false)
  })

  it('greaterThan retourne true si comparé à Optional.empty', () => {
    const montant = Montant.of('5').orElse(Montant.Zero)
    expect(montant.greaterThan(Optional.empty())).toBe(true)
  })

  // --- Méthode lessThan() ---
  it('lessThan retourne true si inférieur', () => {
    const montantPetit = Montant.of('5').orElse(Montant.Zero)
    const montantGrand = Montant.of('10')
    expect(montantPetit.lessThan(montantGrand)).toBe(true)
  })

  it('lessThan retourne false si égal ou supérieur', () => {
    const montant1 = Montant.of('50').orElse(Montant.Zero)
    const montant2 = Montant.of('50')
    expect(montant1.lessThan(montant2)).toBe(false)
  })

  it('lessThan retourne false si comparé à Optional.empty', () => {
    const montant = Montant.of('0').orElse(Montant.Zero)
    expect(montant.lessThan(Optional.empty())).toBe(false)
  })

  // --- Méthode format() ---
  it('format retourne une string sans séparateurs ni décimales', () => {
    const montant = Montant.of('123456').orElse(Montant.Zero)
    expect(montant.format()).toBe('123456')
  })

  it('format retourne "0" pour Montant.Zero', () => {
    expect(Montant.Zero.format()).toBe('0')
  })
})
