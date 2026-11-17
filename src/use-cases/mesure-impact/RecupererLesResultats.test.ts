import { describe, expect, it } from 'vitest'

import { CampagneLoader, RecupererLesResultats, ReponsesDeLaCampagneLoader } from './RecupererLesResultats'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { ReponseEnregistree } from '@/domain/mesure-impact/Resultats'
import { epochTime } from '@/shared/testHelper'

describe('récupérer les résultats d’une campagne de mesure d’impact', () => {
  it('donne les résultats des réponses filtrées, et les filtres possibles sur toutes les réponses', async () => {
    // GIVEN
    const recuperer = new RecupererLesResultats(campagneLoader, reponsesLoader)

    // WHEN
    const resultats = await recuperer.handle({
      filtres: { canal: 'papier' },
      identifiantPublic: 'sicoval',
      structureId: 42,
    })

    // THEN
    expect(resultats).toMatchObject({
      campagne: {
        identifiantPublic: 'sicoval',
        libelleTerritoire: 'Sicoval',
        nom: 'Campagne test',
        ouverture: epochTime,
      },
      filtres: { canal: 'papier' },
      optionsDeFiltre: { codesPostaux: ['31320', '31670'], mois: ['2026-11'] },
      parties: [{ code: 'contexte' }, { code: 'bilan' }, { code: 'vous' }],
      resultats: { total: 1 },
    })
  })

  it('refuse l’accès à une personne d’une autre structure', async () => {
    // WHEN
    const resultats = await new RecupererLesResultats(campagneLoader, reponsesLoader).handle({
      filtres: {},
      identifiantPublic: 'sicoval',
      structureId: 43,
    })

    // THEN
    expect(resultats).toBe('accesRefuse')
  })

  it('une campagne inconnue ne donne rien', async () => {
    // WHEN
    const resultats = await new RecupererLesResultats(campagneLoader, reponsesLoader).handle({
      filtres: {},
      identifiantPublic: 'inconnue',
      structureId: 42,
    })

    // THEN
    expect(resultats).toBeNull()
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

const reponsesLoader: ReponsesDeLaCampagneLoader = {
  async reponses(campagneUid: number): Promise<ReadonlyArray<ReponseEnregistree>> {
    const depot = new Date('2026-11-20T10:00:00.000Z')
    return Promise.resolve(
      campagneUid === 7
        ? [
            { canal: 'papier', contenu: { q26: { valeur: '31670' } }, depot, questionnaireVersion: 'socle-v22' },
            { canal: 'en-ligne', contenu: { q26: { valeur: '31320' } }, depot, questionnaireVersion: 'socle-v22' },
          ]
        : []
    )
  },
}
