import { describe, expect, it } from 'vitest'

import { CampagneLoader, RecupererLeQuestionnairePapier } from './RecupererLeQuestionnairePapier'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { epochTime } from '@/shared/testHelper'

describe('récupérer le questionnaire papier d’une campagne de mesure d’impact', () => {
  it('donne la version papier du questionnaire de la campagne', async () => {
    // WHEN
    const papier = await new RecupererLeQuestionnairePapier(campagneLoader).handle({
      identifiantPublic: 'sicoval',
      structureId: 42,
    })

    // THEN
    expect(papier).toMatchObject({
      identifiantPublic: 'sicoval',
      libelleTerritoire: 'Sicoval',
      questionnaire: {
        parties: [
          { titre: 'Le contexte de vos accompagnements' },
          { titre: 'Le bilan de vos accompagnements' },
          { titre: 'À propos de vous' },
        ],
      },
    })
  })

  it('refuse l’accès à une personne d’une autre structure', async () => {
    // WHEN
    const papier = await new RecupererLeQuestionnairePapier(campagneLoader).handle({
      identifiantPublic: 'sicoval',
      structureId: 43,
    })

    // THEN
    expect(papier).toBe('accesRefuse')
  })

  it.each([
    { identifiantPublic: 'inconnue', intention: 'une campagne inconnue ne donne rien' },
    { identifiantPublic: 'version-inconnue', intention: 'un questionnaire de version inconnue ne donne rien' },
  ])('$intention', async ({ identifiantPublic }) => {
    // WHEN
    const papier = await new RecupererLeQuestionnairePapier(campagneLoader).handle({
      identifiantPublic,
      structureId: 42,
    })

    // THEN
    expect(papier).toBeNull()
  })
})

const campagneLoader: CampagneLoader = {
  async parIdentifiantPublic(identifiantPublic: string): Promise<Campagne | null> {
    const versions: Readonly<Partial<Record<string, string>>> = { sicoval: 'socle-v22', 'version-inconnue': 'socle-v0' }
    const questionnaireVersion = versions[identifiantPublic]
    return Promise.resolve(
      questionnaireVersion === undefined
        ? null
        : Campagne.create({
            fermeture: null,
            identifiantPublic,
            libelleTerritoire: 'Sicoval',
            nom: 'Campagne test',
            ouverture: epochTime,
            questionnaireVersion,
            structureId: 42,
            uid: { value: 7 },
          })
    )
  },
}
