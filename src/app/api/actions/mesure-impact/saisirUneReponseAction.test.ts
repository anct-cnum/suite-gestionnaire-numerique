import * as nextCache from 'next/cache'
import { describe, expect, it, vi } from 'vitest'

import { saisirUneReponseAction } from './saisirUneReponseAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { contexteJournalisationMin } from '@/gateways/shared/contexteJournalisationMin'
import { SaisirUneReponse } from '@/use-cases/mesure-impact/SaisirUneReponse'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('saisir une réponse recueillie sur papier ou par téléphone', () => {
  it('saisit la réponse pour la structure de la personne connectée, et rafraîchit la page de la campagne', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: false, structureId: 42 })
    )
    vi.spyOn(SaisirUneReponse.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await saisirUneReponseAction({
      canal: 'papier',
      contenu: { q3: { valeur: '1-a-4' } },
      identifiantPublic: 'sicoval',
    })

    // THEN
    expect(SaisirUneReponse.prototype.handle).toHaveBeenCalledWith({
      canal: 'papier',
      contenu: { q3: { valeur: '1-a-4' } },
      identifiantPublic: 'sicoval',
      structureId: 42,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/mesure-impact/sicoval')
    expect(messages).toStrictEqual(['OK'])
  })

  it('une personne sans structure saisit sans structure, donc sans accès', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: false, structureId: null })
    )
    vi.spyOn(SaisirUneReponse.prototype, 'handle').mockResolvedValueOnce('accesRefuse')

    // WHEN
    const messages = await saisirUneReponseAction({ canal: 'papier', contenu: {}, identifiantPublic: 'sicoval' })

    // THEN
    expect(SaisirUneReponse.prototype.handle).toHaveBeenCalledWith({
      canal: 'papier',
      contenu: {},
      identifiantPublic: 'sicoval',
      structureId: null,
    })
    expect(messages).toStrictEqual(['Vous ne pouvez pas saisir de réponse pour cette campagne.'])
  })

  it('journalise la saisie, faite par une personne connectée (ADR-007)', async () => {
    // GIVEN
    let contexteDeLaSaisie: unknown
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(SaisirUneReponse.prototype, 'handle').mockImplementationOnce(async () => {
      contexteDeLaSaisie = contexteJournalisationMin.getStore()
      return Promise.resolve('OK')
    })
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    await saisirUneReponseAction({ canal: 'telephone', contenu: {}, identifiantPublic: 'sicoval' })

    // THEN
    expect(contexteDeLaSaisie).toBeDefined()
  })

  it.each([
    { echec: 'accesRefuse' as const, message: 'Vous ne pouvez pas saisir de réponse pour cette campagne.' },
    {
      echec: 'contenuInvalide' as const,
      message: 'Les réponses saisies ne sont pas cohérentes avec le questionnaire.',
    },
    { echec: 'campagneFermee' as const, message: 'Cette campagne n’accepte plus de réponses.' },
  ])('explique un refus : $echec', async ({ echec, message }) => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(SaisirUneReponse.prototype, 'handle').mockResolvedValueOnce(echec)

    // WHEN
    const messages = await saisirUneReponseAction({ canal: 'papier', contenu: {}, identifiantPublic: 'sicoval' })

    // THEN
    expect(messages).toStrictEqual([message])
  })

  it('refuse un canal qui n’est pas une saisie', async () => {
    // GIVEN
    vi.spyOn(SaisirUneReponse.prototype, 'handle')

    // WHEN
    const messages = await saisirUneReponseAction({
      canal: 'en-ligne' as 'papier',
      contenu: {},
      identifiantPublic: 'sicoval',
    })

    // THEN
    expect(messages).toStrictEqual(['Les réponses n’ont pas pu être enregistrées. Veuillez réessayer.'])
    expect(SaisirUneReponse.prototype.handle).not.toHaveBeenCalled()
  })
})
