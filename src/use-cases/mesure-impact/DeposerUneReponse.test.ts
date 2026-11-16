import { beforeEach, describe, expect, it } from 'vitest'

import {
  CampagneLoader,
  DefisConsommesRepository,
  DeposerUneReponse,
  ReponseRepository,
  VerificateurDePreuve,
} from './DeposerUneReponse'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { Contenu } from '@/domain/mesure-impact/Questionnaire'
import { Reponse } from '@/domain/mesure-impact/Reponse'
import { epochTime, epochTimeMinusOneDay, epochTimePlusOneDay } from '@/shared/testHelper'

describe('déposer une réponse à une campagne de mesure d’impact', () => {
  beforeEach(() => {
    reponsesAjoutees = []
    defisConsommes = []
  })

  it('par téléphone, une réponse cohérente est enregistrée avec la date du dépôt', async () => {
    // GIVEN
    const deposer = deposerLe(epochTime)

    // WHEN
    const resultat = await deposer.handle({
      canal: 'telephone',
      contenu: { q3: { valeur: '1-a-4' } },
      identifiantPublic: 'sicoval',
    })

    // THEN
    expect(resultat).toBe('OK')
    expect(reponsesAjoutees.map((reponse) => reponse.state)).toStrictEqual([
      {
        campagneUid: 7,
        canal: 'telephone',
        contenu: { q3: { valeur: '1-a-4' } },
        depot: epochTime.toJSON(),
        questionnaireVersion: 'socle-v22',
      },
    ])
  })

  it.each([
    { date: epochTime, echec: 'campagneIntrouvable', identifiantPublic: 'inconnue', intention: 'campagne inconnue' },
    {
      date: epochTimeMinusOneDay,
      echec: 'campagneFermee',
      identifiantPublic: 'sicoval',
      intention: 'campagne pas encore ouverte',
    },
  ])('refuse le dépôt : $intention', async ({ date, echec, identifiantPublic }) => {
    // GIVEN
    const deposer = deposerLe(date)

    // WHEN
    const resultat = await deposer.handle({ canal: 'telephone', contenu: {}, identifiantPublic })

    // THEN
    expect(resultat).toBe(echec)
    expect(reponsesAjoutees).toStrictEqual([])
  })

  it('en ligne, refuse un questionnaire incomplet', async () => {
    // GIVEN
    const deposer = deposerLe(epochTime)

    // WHEN
    const resultat = await deposer.handle({
      canal: 'en-ligne',
      contenu: { q3: { valeur: '1-a-4' } },
      identifiantPublic: 'sicoval',
    })

    // THEN
    expect(resultat).toBe('contenuInvalide')
    expect(reponsesAjoutees).toStrictEqual([])
  })

  it('en ligne, un questionnaire complet est enregistré quand sa preuve anti-abus est valide, qui ne resservira plus', async () => {
    // WHEN
    const resultat = await deposerLe(epochTime).handle({
      canal: 'en-ligne',
      contenu: questionnaireComplet,
      identifiantPublic: 'sicoval',
      preuve: 'preuve-valide',
    })

    // THEN
    expect(resultat).toBe('OK')
    expect(reponsesAjoutees).toHaveLength(1)
    expect(defisConsommes).toStrictEqual([{ empreinte: 'empreinte-du-defi', expiration: epochTimePlusOneDay }])
  })

  it.each([
    { intention: 'sans preuve', preuve: undefined },
    { intention: 'preuve invalide, expirée ou d’une autre campagne', preuve: 'preuve-invalide' },
    { intention: 'preuve déjà utilisée', preuve: 'preuve-deja-utilisee' },
  ])('en ligne, refuse un questionnaire complet : $intention', async ({ preuve }) => {
    // WHEN
    const resultat = await deposerLe(epochTime).handle({
      canal: 'en-ligne',
      contenu: questionnaireComplet,
      identifiantPublic: 'sicoval',
      preuve,
    })

    // THEN
    expect(resultat).toBe('preuveInvalide')
    expect(reponsesAjoutees).toStrictEqual([])
  })
})

function deposerLe(date: Date): DeposerUneReponse {
  return new DeposerUneReponse(campagneLoader, reponseRepository, verificateurDePreuve, defisConsommesRepository, date)
}

let defisConsommes: Array<Readonly<{ empreinte: string; expiration: Date }>>

let reponsesAjoutees: Array<Reponse>

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

const reponseRepository: ReponseRepository = {
  async ajouter(reponse: Reponse): Promise<void> {
    reponsesAjoutees.push(reponse)
    return Promise.resolve()
  },
}

const verificateurDePreuve: VerificateurDePreuve = {
  async verifier(preuve: string, identifiantPublic: string) {
    const valide = identifiantPublic === 'sicoval' && ['preuve-deja-utilisee', 'preuve-valide'].includes(preuve)
    return Promise.resolve(
      valide
        ? {
            empreinte: preuve === 'preuve-deja-utilisee' ? 'deja-utilisee' : 'empreinte-du-defi',
            expiration: epochTimePlusOneDay,
          }
        : null
    )
  },
}

const defisConsommesRepository: DefisConsommesRepository = {
  async consommer(empreinte: string, expiration: Date): Promise<boolean> {
    if (empreinte === 'deja-utilisee') {
      return Promise.resolve(false)
    }
    defisConsommes.push({ empreinte, expiration })
    return Promise.resolve(true)
  },
}

const questionnaireComplet: Contenu = {
  q1: { valeur: ['travailler'] },
  q10: { valeur: '2' },
  q11: { valeur: '4' },
  q12: { valeur: 'plutot-non' },
  q14: { valeur: { tablette: 'plutot-oui' } },
  q15: { valeur: 'plutot-non' },
  q17: { valeur: 'mairie' },
  q18: { valeur: ['autonome'] },
  q19: { valeur: 'oui' },
  q2: { valeur: ['curiosite'] },
  q20: { valeur: 'femme' },
  q21: { valeur: '60-69' },
  q22: { valeur: 'seul' },
  q23: { valeur: 'retraite' },
  q24: { valeur: 'brevet' },
  q25: { valeur: 'sans-activite' },
  q26: { valeur: '31320' },
  q3: { valeur: '1-a-4' },
  q4: { valeur: ['individuel'] },
  q5: { valeur: ['tablette'] },
  q6: { valeur: ['tablette'] },
  q7: { valeur: 'non' },
  q8: { valeur: ['recherche-informations'] },
  q9: { valeur: 'plutot-oui' },
}
