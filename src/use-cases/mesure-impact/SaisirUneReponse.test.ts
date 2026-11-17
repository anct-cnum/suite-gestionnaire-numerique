import { beforeEach, describe, expect, it } from 'vitest'

import { CampagneLoader, ReponseRepository, SaisirUneReponse } from './SaisirUneReponse'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { Reponse } from '@/domain/mesure-impact/Reponse'
import { epochTime, epochTimeMinusOneDay } from '@/shared/testHelper'

describe('saisir une réponse recueillie sur papier ou par téléphone', () => {
  beforeEach(() => {
    reponsesAjoutees = []
  })

  it.each([
    { canal: 'papier' as const, intention: 'sur papier, une réponse incomplète' },
    { canal: 'telephone' as const, intention: 'par téléphone, une réponse incomplète' },
  ])('enregistre $intention avec son canal', async ({ canal }) => {
    // GIVEN
    const saisir = new SaisirUneReponse(campagneLoader, repository, epochTime)

    // WHEN
    const resultat = await saisir.handle({
      canal,
      contenu: { q3: { valeur: '1-a-4' } },
      identifiantPublic: 'sicoval',
      structureId: 42,
    })

    // THEN
    expect(resultat).toBe('OK')
    expect(reponsesAjoutees.map((reponse) => reponse.state)).toStrictEqual([
      {
        campagneUid: 7,
        canal,
        contenu: { q3: { valeur: '1-a-4' } },
        depot: epochTime.toJSON(),
        questionnaireVersion: 'socle-v22',
      },
    ])
  })

  it.each([
    {
      echec: 'accesRefuse',
      identifiantPublic: 'sicoval',
      intention: 'personne d’une autre structure',
      structureId: 43,
    },
    { echec: 'campagneIntrouvable', identifiantPublic: 'inconnue', intention: 'campagne inconnue', structureId: 42 },
  ])('refuse la saisie : $intention', async ({ echec, identifiantPublic, structureId }) => {
    // GIVEN
    const saisir = new SaisirUneReponse(campagneLoader, repository, epochTime)

    // WHEN
    const resultat = await saisir.handle({ canal: 'papier', contenu: {}, identifiantPublic, structureId })

    // THEN
    expect(resultat).toBe(echec)
    expect(reponsesAjoutees).toStrictEqual([])
  })

  it('applique les règles du questionnaire, comme en ligne', async () => {
    // GIVEN
    const saisir = new SaisirUneReponse(campagneLoader, repository, epochTime)

    // WHEN
    const resultat = await saisir.handle({
      canal: 'telephone',
      // La question 13 n'est posée qu'à qui a le sentiment d'avoir progressé
      contenu: { q12: { valeur: 'pas-du-tout' }, q13: { valeur: ['travailler'] } },
      identifiantPublic: 'sicoval',
      structureId: 42,
    })

    // THEN
    expect(resultat).toBe('contenuInvalide')
  })

  it('refuse une saisie avant l’ouverture de la campagne', async () => {
    // GIVEN
    const saisir = new SaisirUneReponse(campagneLoader, repository, epochTimeMinusOneDay)

    // WHEN
    const resultat = await saisir.handle({
      canal: 'papier',
      contenu: {},
      identifiantPublic: 'sicoval',
      structureId: 42,
    })

    // THEN
    expect(resultat).toBe('campagneFermee')
  })
})

let reponsesAjoutees: Array<Reponse> = []

const repository: ReponseRepository = {
  async ajouter(reponse: Reponse): Promise<void> {
    reponsesAjoutees.push(reponse)
    return Promise.resolve()
  },
}

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
