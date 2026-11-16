import { describe, expect, it } from 'vitest'

import { CampagnePubliqueLoader, RecupererLaCampagnePublique } from './RecupererLaCampagnePublique'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { epochTime, epochTimeMinusOneDay, epochTimePlusOneDay } from '@/shared/testHelper'

describe('récupérer la campagne d’un questionnaire public', () => {
  it('donne ce qu’il faut pour afficher le questionnaire, et si la campagne accepte des réponses', async () => {
    // GIVEN
    const recuperer = new RecupererLaCampagnePublique(loader, epochTime)

    // WHEN
    const campagne = await recuperer.handle({ identifiantPublic: 'sicoval' })

    // THEN
    expect(campagne).toStrictEqual({
      identifiantPublic: 'sicoval',
      libelleTerritoire: 'Sicoval',
      ouverte: true,
      questionnaireVersion: 'socle-v22',
    })
  })

  it.each([
    { date: epochTimeMinusOneDay, intention: 'avant son ouverture' },
    { date: epochTimePlusOneDay, intention: 'à sa fermeture' },
  ])('la campagne est fermée $intention', async ({ date }) => {
    // GIVEN
    const recuperer = new RecupererLaCampagnePublique(loader, date)

    // WHEN
    const campagne = await recuperer.handle({ identifiantPublic: 'sicoval' })

    // THEN
    expect(campagne?.ouverte).toBe(false)
  })

  it('une campagne inconnue ne donne rien', async () => {
    // GIVEN
    const recuperer = new RecupererLaCampagnePublique(loader, epochTime)

    // WHEN
    const campagne = await recuperer.handle({ identifiantPublic: 'inconnue' })

    // THEN
    expect(campagne).toBeNull()
  })
})

const loader: CampagnePubliqueLoader = {
  async parIdentifiantPublic(identifiantPublic: string): Promise<Campagne | null> {
    return Promise.resolve(
      identifiantPublic === 'sicoval'
        ? Campagne.create({
            fermeture: epochTimePlusOneDay,
            identifiantPublic: 'sicoval',
            libelleTerritoire: 'Sicoval',
            nom: 'Campagne test',
            ouverture: epochTime,
            questionnaireVersion: 'socle-v22',
            structureId: 42,
            uid: { value: 7 },
          })
        : null
    )
  },
}
