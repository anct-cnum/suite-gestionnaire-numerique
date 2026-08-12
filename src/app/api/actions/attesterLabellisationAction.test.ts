import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { attesterLabellisationAction } from './attesterLabellisationAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaEligibiliteLabelConumLoader } from '@/gateways/tableauDeBord/PrismaEligibiliteLabelConumLoader'
import { AttesterLabellisationStructure } from '@/use-cases/commands/AttesterLabellisationStructure'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('attester la labellisation action', () => {
  it('enregistre l’attestation et purge le cache', async () => {
    // GIVEN
    stubGestionnaireBetaTesteur()
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible').mockResolvedValueOnce(true)
    vi.spyOn(AttesterLabellisationStructure.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await attesterLabellisationAction({
      path: '/',
      structureId: 978,
    })

    // THEN
    expect(AttesterLabellisationStructure.prototype.handle).toHaveBeenCalledWith({
      structureId: 978,
      utilisateurId: 1,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/')
    expect(messages).toStrictEqual(['OK'])
  })

  it('renvoie une erreur de validation quand l’identifiant de la structure est invalide', async () => {
    // WHEN
    const messages = await attesterLabellisationAction({
      path: '/',
      structureId: -1,
    })

    // THEN
    expect(messages).toStrictEqual(["L'identifiant de la structure doit être un entier positif"])
  })

  it('refuse l’action à un utilisateur qui n’est pas gestionnaire de structure', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )

    // WHEN
    const messages = await attesterLabellisationAction({
      path: '/',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux gestionnaires autorisés'])
  })

  it('refuse l’action à un gestionnaire de structure non bêta-testeur', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({
        isBetaTesteur: false,
        role: {
          categorie: 'structure',
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire structure',
          organisation: 'Solidarnum',
          rolesGerables: ['gestionnaire_structure'],
          type: 'gestionnaire_structure',
        },
        structureId: 978,
      })
    )
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValueOnce([])

    // WHEN
    const messages = await attesterLabellisationAction({
      path: '/',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux gestionnaires autorisés'])
  })

  it('refuse l’attestation d’une structure qui n’est pas celle du gestionnaire', async () => {
    // GIVEN
    stubGestionnaireBetaTesteur()

    // WHEN
    const messages = await attesterLabellisationAction({
      path: '/',
      structureId: 999,
    })

    // THEN
    expect(messages).toStrictEqual(['Vous ne pouvez labelliser que votre structure'])
  })

  it('refuse l’attestation quand la structure est déjà labellisée', async () => {
    // GIVEN
    stubGestionnaireBetaTesteur()
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible').mockResolvedValueOnce(true)
    vi.spyOn(AttesterLabellisationStructure.prototype, 'handle').mockResolvedValueOnce('dejaLabellisee')

    // WHEN
    const messages = await attesterLabellisationAction({
      path: '/',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Votre structure est déjà labellisée conseiller numérique'])
  })

  it('refuse l’attestation quand la structure n’est pas éligible au label', async () => {
    // GIVEN
    stubGestionnaireBetaTesteur()
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible').mockResolvedValueOnce(false)

    // WHEN
    const messages = await attesterLabellisationAction({
      path: '/',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Votre structure n’est pas éligible au label conseiller numérique'])
  })
})

function stubGestionnaireBetaTesteur(): void {
  vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
  vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
    utilisateurReadModelFactory({
      isBetaTesteur: true,
      role: {
        categorie: 'structure',
        doesItBelongToGroupeAdmin: false,
        nom: 'Gestionnaire structure',
        organisation: 'Solidarnum',
        rolesGerables: ['gestionnaire_structure'],
        type: 'gestionnaire_structure',
      },
      structureId: 978,
    })
  )
  vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValueOnce([])
}
