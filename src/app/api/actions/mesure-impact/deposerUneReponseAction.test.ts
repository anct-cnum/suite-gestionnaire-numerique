import { describe, expect, it, vi } from 'vitest'

import { deposerUneReponseAction } from './deposerUneReponseAction'
import { contexteJournalisationMin } from '@/gateways/shared/contexteJournalisationMin'
import { DeposerUneReponse } from '@/use-cases/mesure-impact/DeposerUneReponse'

describe('déposer une réponse au questionnaire de mesure d’impact', () => {
  it('dépose la réponse en ligne de la campagne', async () => {
    // GIVEN
    vi.spyOn(DeposerUneReponse.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await deposerUneReponseAction({
      contenu: { q14: { valeur: { tablette: 'plutot-oui' } }, q5: { lequel: [], valeur: ['tablette'] } },
      identifiantPublic: 'sicoval',
      preuve: 'preuve-de-travail',
    })

    // THEN
    expect(DeposerUneReponse.prototype.handle).toHaveBeenCalledWith({
      canal: 'en-ligne',
      contenu: { q14: { valeur: { tablette: 'plutot-oui' } }, q5: { lequel: [], valeur: ['tablette'] } },
      identifiantPublic: 'sicoval',
      preuve: 'preuve-de-travail',
    })
    expect(messages).toStrictEqual(['OK'])
  })

  it('ne journalise pas le dépôt : même depuis un navigateur connecté à MIN, la réponse reste anonyme', async () => {
    // GIVEN
    let contexteDuDepot: unknown = 'non déposé'
    vi.spyOn(DeposerUneReponse.prototype, 'handle').mockImplementationOnce(async () => {
      contexteDuDepot = contexteJournalisationMin.getStore()
      return Promise.resolve('OK')
    })

    // WHEN
    await deposerUneReponseAction({ contenu: {}, identifiantPublic: 'sicoval', preuve: 'preuve-de-travail' })

    // THEN
    expect(contexteDuDepot).toBeUndefined()
  })

  it.each([
    { echec: 'campagneIntrouvable' as const, message: 'Ce questionnaire n’existe pas.' },
    { echec: 'campagneFermee' as const, message: 'Ce questionnaire n’accepte plus de réponses.' },
    { echec: 'contenuInvalide' as const, message: 'Vos réponses n’ont pas pu être envoyées. Veuillez réessayer.' },
    { echec: 'preuveInvalide' as const, message: 'Vos réponses n’ont pas pu être envoyées. Veuillez réessayer.' },
    {
      echec: 'questionnaireInconnu' as const,
      message: 'Vos réponses n’ont pas pu être envoyées. Veuillez réessayer.',
    },
  ])('traduit l’échec « $echec »', async ({ echec, message }) => {
    // GIVEN
    vi.spyOn(DeposerUneReponse.prototype, 'handle').mockResolvedValueOnce(echec)

    // WHEN
    const messages = await deposerUneReponseAction({ contenu: {}, identifiantPublic: 'sicoval', preuve: 'preuve' })

    // THEN
    expect(messages).toStrictEqual([message])
  })

  it.each([
    { contenu: {}, identifiantPublic: '', intention: 'sans campagne' },
    { contenu: { q1: { valeur: 3 } }, identifiantPublic: 'sicoval', intention: 'valeur d’un type inattendu' },
    { contenu: { q1: { inconnu: 'x', valeur: 'a' } }, identifiantPublic: 'sicoval', intention: 'champ inattendu' },
    {
      contenu: Object.fromEntries(Array.from({ length: 41 }, (_, index) => [`q${index}`, { valeur: 'a' }])),
      identifiantPublic: 'sicoval',
      intention: 'trop de questions',
    },
  ])('refuse un envoi mal formé : $intention', async ({ contenu, identifiantPublic }) => {
    // GIVEN
    const handle = vi.spyOn(DeposerUneReponse.prototype, 'handle')

    // WHEN
    const messages = await deposerUneReponseAction({ contenu: contenu as never, identifiantPublic, preuve: 'preuve' })

    // THEN
    expect(messages).toStrictEqual(['Vos réponses n’ont pas pu être envoyées. Veuillez réessayer.'])
    expect(handle).not.toHaveBeenCalled()
  })
})
