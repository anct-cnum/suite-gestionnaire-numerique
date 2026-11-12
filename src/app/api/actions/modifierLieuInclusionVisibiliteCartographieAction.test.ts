import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { modifierLieuInclusionVisibiliteCartographieAction } from './modifierLieuInclusionVisibiliteCartographieAction'
import prisma from '../../../../prisma/prismaClient'
import { utilisateurFactory } from '@/domain/testHelper'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ModifierLieuInclusionVisibiliteCartographie } from '@/use-cases/commands/ModifierLieuInclusionVisibiliteCartographie'
import { lieuDetailsReadModelFactory, utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('modifier la visibilité cartographique d’un lieu d’inclusion action', () => {
  it('enregistre la visibilité et purge le cache quand un bêta-testeur avec les droits confirme', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory()
    )
    vi.spyOn(prisma.membreRecord, 'findMany').mockResolvedValueOnce([])
    vi.spyOn(ModifierLieuInclusionVisibiliteCartographie.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await modifierLieuInclusionVisibiliteCartographieAction({
      lieuId: '42',
      path: '/liste-lieux-inclusion',
      visiblePourCartographie: false,
    })

    // THEN
    expect(ModifierLieuInclusionVisibiliteCartographie.prototype.handle).toHaveBeenCalledWith({
      lieuId: '42',
      visiblePourCartographie: false,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/liste-lieux-inclusion')
    expect(messages).toStrictEqual(['OK'])
  })

  it('renvoie une erreur de validation quand l’identifiant du lieu est vide', async () => {
    // WHEN
    const messages = await modifierLieuInclusionVisibiliteCartographieAction({
      lieuId: '',
      path: '/liste-lieux-inclusion',
      visiblePourCartographie: true,
    })

    // THEN
    expect(messages).toStrictEqual(["L'identifiant du lieu doit être renseigné"])
  })

  // La porte bêta est ouverte (#1716) : un gestionnaire hors bêta n'est plus arrêté par le
  // flag, il est jugé sur son seul périmètre — ici le lieu est dans son département.
  it('laisse un gestionnaire hors bêta changer la visibilité d’un lieu de son département (#1716)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({
        isBetaTesteur: false,
        role: {
          ...utilisateurReadModelFactory().role,
          nom: 'Gestionnaire département',
          type: 'gestionnaire_departement',
        },
      })
    )
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory()
    )
    vi.spyOn(ModifierLieuInclusionVisibiliteCartographie.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await modifierLieuInclusionVisibiliteCartographieAction({
      lieuId: '42',
      path: '/liste-lieux-inclusion',
      visiblePourCartographie: true,
    })

    // THEN
    expect(messages).toStrictEqual(['OK'])
    expect(ModifierLieuInclusionVisibiliteCartographie.prototype.handle).toHaveBeenCalledWith({
      lieuId: '42',
      visiblePourCartographie: true,
    })
  })

  it('change la visibilité d’un lieu géré dans la Coop : le registre fait foi (#2105)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory({ estLieuCoop: true })
    )
    vi.spyOn(ModifierLieuInclusionVisibiliteCartographie.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await modifierLieuInclusionVisibiliteCartographieAction({
      lieuId: '42',
      path: '/liste-lieux-inclusion',
      visiblePourCartographie: false,
    })

    // THEN
    expect(messages).toStrictEqual(['OK'])
    expect(ModifierLieuInclusionVisibiliteCartographie.prototype.handle).toHaveBeenCalledTimes(1)
  })
})
