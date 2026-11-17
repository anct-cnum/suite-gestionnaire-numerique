import { describe, expect, it } from 'vitest'

import { CampagneLoader, RecupererVotreCampagne, SuiviDesReponsesLoader } from './RecupererVotreCampagne'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

describe('récupérer la campagne de mesure d’impact de sa structure', () => {
  it('donne les détails de la campagne et le suivi des réponses', async () => {
    // GIVEN
    const recuperer = new RecupererVotreCampagne(campagneLoader, suiviLoader, epochTimePlusOneDay)

    // WHEN
    const campagne = await recuperer.handle({ identifiantPublic: 'sicoval', structureId: 42 })

    // THEN
    expect(campagne).toStrictEqual({
      derniereReponse: epochTimePlusOneDay,
      identifiantPublic: 'sicoval',
      libelleTerritoire: 'Sicoval',
      nom: 'Campagne test',
      nombreDeQuestions: 26,
      nombreDeReponses: 148,
      ouverte: true,
      ouverture: epochTime,
      questionnaireVersion: 'socle-v22',
    })
  })

  it('refuse l’accès à une personne d’une autre structure', async () => {
    // GIVEN
    const recuperer = new RecupererVotreCampagne(campagneLoader, suiviLoader, epochTime)

    // WHEN
    const campagne = await recuperer.handle({ identifiantPublic: 'sicoval', structureId: 43 })

    // THEN
    expect(campagne).toBe('accesRefuse')
  })

  it('une campagne inconnue ne donne rien', async () => {
    // GIVEN
    const recuperer = new RecupererVotreCampagne(campagneLoader, suiviLoader, epochTime)

    // WHEN
    const campagne = await recuperer.handle({ identifiantPublic: 'inconnue', structureId: 42 })

    // THEN
    expect(campagne).toBeNull()
  })
})

const campagneLoader: CampagneLoader = {
  async parIdentifiantPublic(identifiantPublic: string): Promise<Campagne | null> {
    return Promise.resolve(
      identifiantPublic === 'sicoval'
        ? Campagne.create({
            fermeture: null,
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

const suiviLoader: SuiviDesReponsesLoader = {
  async suivi(campagneUid: number): Promise<Readonly<{ derniere: Date | null; nombre: number }>> {
    return Promise.resolve(
      campagneUid === 7 ? { derniere: epochTimePlusOneDay, nombre: 148 } : { derniere: null, nombre: 0 }
    )
  },
}
