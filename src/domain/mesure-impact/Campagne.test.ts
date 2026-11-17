import { describe, expect, it } from 'vitest'

import { Campagne } from './Campagne'
import { epochTime, epochTimeMinusOneDay, epochTimePlusOneDay } from '@/shared/testHelper'

describe('campagne de mesure d’impact', () => {
  it('expose son état', () => {
    // WHEN
    const campagne = uneCampagne(null)

    // THEN
    expect(campagne.state).toStrictEqual({
      fermeture: null,
      identifiantPublic: 'sicoval',
      libelleTerritoire: 'Sicoval',
      nom: 'Campagne test, automne 2026',
      ouverture: epochTime.toJSON(),
      questionnaireVersion: 'socle-v22',
      structureId: 42,
      uid: { value: 7 },
    })
    expect(uneCampagne(epochTimePlusOneDay).state.fermeture).toBe(epochTimePlusOneDay.toJSON())
  })

  it.each([
    { accepte: false, date: epochTimeMinusOneDay, fermeture: null, intention: 'pas avant son ouverture' },
    { accepte: true, date: epochTime, fermeture: null, intention: 'dès son ouverture' },
    { accepte: true, date: epochTimePlusOneDay, fermeture: null, intention: 'sans date de fin, ensuite' },
    { accepte: false, date: epochTimePlusOneDay, fermeture: epochTimePlusOneDay, intention: 'pas à sa fermeture' },
  ])('accepte des réponses : $intention', ({ accepte, date, fermeture }) => {
    // GIVEN
    const campagne = uneCampagne(fermeture)

    // THEN
    expect(campagne.accepteDesReponses(date)).toBe(accepte)
  })

  it.each([
    { intention: 'la structure qui la porte', pilotee: true, structureId: 42 },
    { intention: 'pas une autre structure', pilotee: false, structureId: 43 },
    { intention: 'pas une personne sans structure', pilotee: false, structureId: null },
  ])('est pilotée par $intention', ({ pilotee, structureId }) => {
    // GIVEN
    const campagne = uneCampagne(null)

    // THEN
    expect(campagne.estPiloteePar(structureId)).toBe(pilotee)
  })
})

function uneCampagne(fermeture: Date | null): Campagne {
  return Campagne.create({
    fermeture,
    identifiantPublic: 'sicoval',
    libelleTerritoire: 'Sicoval',
    nom: 'Campagne test, automne 2026',
    ouverture: epochTime,
    questionnaireVersion: 'socle-v22',
    structureId: 42,
    uid: { value: 7 },
  })
}
