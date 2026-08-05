import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { supprimerUnLieuInclusionAction } from './supprimerUnLieuInclusionAction'
import prisma from '../../../../prisma/prismaClient'
import { utilisateurFactory } from '@/domain/testHelper'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { SupprimerUnLieuInclusion } from '@/use-cases/commands/SupprimerUnLieuInclusion'
import { LieuDetailsReadModel } from '@/use-cases/queries/RecupererLieuDetails'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('supprimer un lieu d’inclusion action', () => {
  it('supprime le lieu et purge le cache quand un bêta-testeur avec les droits confirme', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findByUid').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(lieuDetailsReadModel)
    vi.spyOn(prisma.membreRecord, 'findMany').mockResolvedValueOnce([])
    vi.spyOn(SupprimerUnLieuInclusion.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await supprimerUnLieuInclusionAction({ lieuId: '42', path: '/liste-lieux-inclusion' })

    // THEN
    expect(SupprimerUnLieuInclusion.prototype.handle).toHaveBeenCalledWith({
      lieuId: '42',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/liste-lieux-inclusion')
    expect(messages).toStrictEqual(['OK'])
  })

  it('renvoie une erreur de validation quand l’identifiant du lieu est vide', async () => {
    // WHEN
    const messages = await supprimerUnLieuInclusionAction({ lieuId: '', path: '/liste-lieux-inclusion' })

    // THEN
    expect(messages).toStrictEqual(["L'identifiant du lieu doit être renseigné"])
  })

  it('refuse l’action à un utilisateur non bêta-testeur', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findByUid').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: false })
    )

    // WHEN
    const messages = await supprimerUnLieuInclusionAction({ lieuId: '42', path: '/liste-lieux-inclusion' })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux bêta-testeurs'])
  })

  it('renvoie une erreur quand le lieu est introuvable', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findByUid').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce({
      message: 'Lieu non trouvé',
      type: 'error',
    })

    // WHEN
    const messages = await supprimerUnLieuInclusionAction({ lieuId: '42', path: '/liste-lieux-inclusion' })

    // THEN
    expect(messages).toStrictEqual(['Lieu non trouvé'])
  })

  it('refuse l’action à un utilisateur bêta-testeur sans les droits de modification du lieu', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findByUid').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce({
      ...lieuDetailsReadModel,
      codeDepartement: '93',
    })
    vi.spyOn(prisma.membreRecord, 'findMany').mockResolvedValueOnce([])

    // WHEN
    const messages = await supprimerUnLieuInclusionAction({ lieuId: '42', path: '/liste-lieux-inclusion' })

    // THEN
    expect(messages).toStrictEqual(["Vous n'avez pas les droits pour supprimer ce lieu"])
  })
})

const lieuDetailsReadModel: LieuDetailsReadModel = {
  codeDepartement: '75',
  estArchive: false,
  header: {
    nom: 'Mon lieu',
    tags: [],
  },
  informationsGenerales: {
    adresse: '1 rue de la Paix, 75001 Paris',
    nomStructure: 'Ma Structure',
  },
  lieuAccueilPublic: {},
  personnesTravaillant: [],
  servicesInclusionNumerique: [],
  structureId: 42,
}
