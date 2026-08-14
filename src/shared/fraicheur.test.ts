import { describe, expect, it } from 'vitest'

import { bornesFraicheur, couleurFraicheur } from './fraicheur'
import { epochTime } from './testHelper'

const millisecondesParMois = 1000 * 60 * 60 * 24 * 30.44

function ilYaDesMois(mois: number): Date {
  return new Date(epochTime.getTime() - mois * millisecondesParMois)
}

describe('fraîcheur des données d’un lieu', () => {
  it.each([
    { attendu: 'blue', intention: 'moins de 6 mois : à jour', updatedAt: ilYaDesMois(3) },
    { attendu: 'blue', intention: 'juste avant 6 mois : à jour', updatedAt: ilYaDesMois(5.99) },
    { attendu: 'yellow', intention: 'exactement 6 mois : à surveiller', updatedAt: ilYaDesMois(6) },
    { attendu: 'yellow', intention: 'entre 6 et 12 mois : à surveiller', updatedAt: ilYaDesMois(9) },
    { attendu: 'orange', intention: 'exactement 12 mois : à vérifier', updatedAt: ilYaDesMois(12) },
    { attendu: 'orange', intention: 'entre 12 et 18 mois : à vérifier', updatedAt: ilYaDesMois(15) },
    { attendu: 'red', intention: 'exactement 18 mois : à actualiser', updatedAt: ilYaDesMois(18) },
    { attendu: 'red', intention: 'plus de 18 mois : à actualiser', updatedAt: ilYaDesMois(24) },
    { attendu: 'red', intention: 'sans date de mise à jour : à actualiser', updatedAt: null },
  ])('$intention', ({ attendu, updatedAt }) => {
    // WHEN
    const couleur = couleurFraicheur(updatedAt, epochTime)

    // THEN
    expect(couleur).toBe(attendu)
  })

  it.each([
    { attendu: { apres: ilYaDesMois(6), jusqua: undefined }, couleur: 'blue' as const },
    { attendu: { apres: ilYaDesMois(12), jusqua: ilYaDesMois(6) }, couleur: 'yellow' as const },
    { attendu: { apres: ilYaDesMois(18), jusqua: ilYaDesMois(12) }, couleur: 'orange' as const },
    { attendu: { apres: undefined, jusqua: ilYaDesMois(18) }, couleur: 'red' as const },
  ])('les bornes du statut $couleur correspondent aux seuils de la pastille', ({ attendu, couleur }) => {
    // WHEN
    const bornes = bornesFraicheur(couleur, epochTime)

    // THEN
    expect(bornes.apres).toStrictEqual(attendu.apres)
    expect(bornes.jusqua).toStrictEqual(attendu.jusqua)
  })

  it.each([
    { couleur: 'blue' as const, updatedAt: ilYaDesMois(3) },
    { couleur: 'yellow' as const, updatedAt: ilYaDesMois(9) },
    { couleur: 'orange' as const, updatedAt: ilYaDesMois(15) },
    { couleur: 'red' as const, updatedAt: ilYaDesMois(24) },
  ])('une date classée $couleur par la pastille est incluse dans les bornes $couleur', ({ couleur, updatedAt }) => {
    // GIVEN
    const { apres, jusqua } = bornesFraicheur(couleur, epochTime)

    // WHEN
    const couleurPastille = couleurFraicheur(updatedAt, epochTime)

    // THEN
    expect(couleurPastille).toBe(couleur)
    expect(updatedAt.getTime()).toBeGreaterThan(apres?.getTime() ?? Number.NEGATIVE_INFINITY)
    expect(updatedAt.getTime()).toBeLessThanOrEqual(jusqua?.getTime() ?? Number.POSITIVE_INFINITY)
  })
})
