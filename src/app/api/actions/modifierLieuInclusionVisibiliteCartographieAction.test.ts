import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { modifierLieuInclusionVisibiliteCartographieAction } from './modifierLieuInclusionVisibiliteCartographieAction'
import { MESSAGE_LIEU_GERE_PAR_LA_COOP } from './shared/verifierDroitsLieu'
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

  it('refuse l’action à un utilisateur non bêta-testeur (#1951)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: false })
    )
    vi.spyOn(ModifierLieuInclusionVisibiliteCartographie.prototype, 'handle')

    // WHEN
    const messages = await modifierLieuInclusionVisibiliteCartographieAction({
      lieuId: '42',
      path: '/liste-lieux-inclusion',
      visiblePourCartographie: true,
    })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux bêta-testeurs'])
    expect(ModifierLieuInclusionVisibiliteCartographie.prototype.handle).not.toHaveBeenCalled()
  })

  it('refuse de changer la visibilité d’un lieu géré dans la Coop (#1951)', async () => {
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
    vi.spyOn(ModifierLieuInclusionVisibiliteCartographie.prototype, 'handle')

    // WHEN
    const messages = await modifierLieuInclusionVisibiliteCartographieAction({
      lieuId: '42',
      path: '/liste-lieux-inclusion',
      visiblePourCartographie: true,
    })

    // THEN
    expect(messages).toStrictEqual([MESSAGE_LIEU_GERE_PAR_LA_COOP])
    expect(ModifierLieuInclusionVisibiliteCartographie.prototype.handle).not.toHaveBeenCalled()
  })
})
