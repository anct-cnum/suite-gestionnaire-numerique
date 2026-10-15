import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { modifierLieuInclusionServicesModaliteAction } from './modifierLieuInclusionServicesModaliteAction'
import { utilisateurFactory } from '@/domain/testHelper'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ModifierLieuInclusionServicesModalite } from '@/use-cases/commands/ModifierLieuInclusionServicesModalite'
import { lieuDetailsReadModelFactory, utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('modifier les modalités d’accès d’un lieu d’inclusion action', () => {
  it.each([
    {
      intention: 'un numéro de téléphone que le standard ne reconnaît pas',
      message: 'Veuillez renseigner un numéro de téléphone français ou d’outre-mer',
      saisie: { telephone: '12' },
    },
    {
      intention: 'un courriel invalide',
      message: 'Veuillez renseigner une adresse électronique valide',
      saisie: { email: 'pas un courriel' },
    },
  ])('refuse $intention, sans consulter la session (#2103)', async ({ message, saisie }) => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId')

    // WHEN
    const messages = await modifierLieuInclusionServicesModaliteAction({ ...modification, ...saisie })

    // THEN
    expect(messages).toStrictEqual([message])
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })

  it('range le téléphone sous sa forme canonique, celle du standard (#2103)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory({ estLieuCoop: false })
    )
    vi.spyOn(ModifierLieuInclusionServicesModalite.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await modifierLieuInclusionServicesModaliteAction({
      ...modification,
      email: ' contact@exemple.fr ',
      telephone: '01 02 03 04 05',
    })

    // THEN
    expect(messages).toStrictEqual(['OK'])
    expect(ModifierLieuInclusionServicesModalite.prototype.handle).toHaveBeenCalledWith({
      email: 'contact@exemple.fr',
      fraisACharge: ['Gratuit'],
      modalitesAcces: ['Se présenter'],
      structureId: '42',
      telephone: '+33102030405',
    })
  })
})

const modification = {
  fraisACharge: ['Gratuit'],
  modalitesAcces: ['Se présenter'],
  path: '/lieu/42',
  structureId: '42',
}
