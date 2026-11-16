import { describe, expect, it } from 'vitest'

import { Campagne } from './Campagne'
import { Reponse } from './Reponse'
import { epochTime, epochTimeMinusOneDay } from '@/shared/testHelper'

describe('réponse à une campagne de mesure d’impact', () => {
  it('par téléphone, une réponse cohérente est déposée avec la version du questionnaire de la campagne', () => {
    // WHEN
    const reponse = Reponse.deposer({
      campagne: uneCampagne('socle-v22'),
      canal: 'telephone',
      contenu: { q3: { valeur: '1-a-4' } },
      date: epochTime,
    })

    // THEN
    expect(reponse).toBeInstanceOf(Reponse)
    expect((reponse as Reponse).state).toStrictEqual({
      campagneUid: 7,
      canal: 'telephone',
      contenu: { q3: { valeur: '1-a-4' } },
      depot: epochTime.toJSON(),
      questionnaireVersion: 'socle-v22',
    })
  })

  it('l’heure du dépôt est arrondie à l’heure, pour qu’elle ne désigne pas une séance de médiation', () => {
    // WHEN
    const reponse = Reponse.deposer({
      campagne: uneCampagne('socle-v22'),
      canal: 'telephone',
      contenu: { q3: { valeur: '1-a-4' } },
      date: new Date('2026-11-16T14:32:17.123Z'),
    })

    // THEN
    expect((reponse as Reponse).state.depot).toBe('2026-11-16T14:00:00.000Z')
  })

  it.each([
    {
      campagne: uneCampagne('socle-v22'),
      date: epochTimeMinusOneDay,
      echec: 'campagneFermee',
      intention: 'la campagne n’accepte pas encore de réponses',
    },
    {
      campagne: uneCampagne('version-retiree'),
      date: epochTime,
      echec: 'questionnaireInconnu',
      intention: 'la version du questionnaire est inconnue',
    },
  ])('refuse le dépôt quand $intention', ({ campagne, date, echec }) => {
    // WHEN
    const reponse = Reponse.deposer({ campagne, canal: 'telephone', contenu: {}, date })

    // THEN
    expect(reponse).toBe(echec)
  })

  it('en ligne, refuse un questionnaire incomplet', () => {
    // WHEN
    const reponse = Reponse.deposer({
      campagne: uneCampagne('socle-v22'),
      canal: 'en-ligne',
      contenu: { q3: { valeur: '1-a-4' } },
      date: epochTime,
    })

    // THEN
    expect(reponse).toBe('contenuInvalide')
  })
})

function uneCampagne(questionnaireVersion: string): Campagne {
  return Campagne.create({
    fermeture: null,
    identifiantPublic: 'sicoval',
    libelleTerritoire: 'Sicoval',
    nom: 'Campagne test',
    ouverture: epochTime,
    questionnaireVersion,
    structureId: 42,
    uid: { value: 7 },
  })
}
