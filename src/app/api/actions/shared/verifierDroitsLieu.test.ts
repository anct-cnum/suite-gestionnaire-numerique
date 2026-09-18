import { describe, expect, it } from 'vitest'

import { MESSAGE_LIEU_GERE_PAR_LA_COOP, verifierDroitsLieu } from './verifierDroitsLieu'
import prisma from '../../../../../prisma/prismaClient'
import { utilisateurFactory } from '@/domain/testHelper'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { lieuDetailsReadModelFactory, utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('vérifier les droits sur un lieu d’inclusion (helper des actions)', () => {
  it('autorise un administrateur et renvoie le lieu chargé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    const lieu = lieuDetailsReadModelFactory()
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(lieu)
    vi.spyOn(prisma.membreRecord, 'findMany').mockResolvedValueOnce([])

    // WHEN
    const verification = await verifierDroitsLieu('42', { action: 'modifier', reserveAuxBetaTesteurs: false })

    // THEN
    expect(verification).toStrictEqual({ lieu, statut: 'ok' })
  })

  it('ne consulte pas le flag bêta quand l’action n’y est pas réservée', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById')
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory()
    )
    vi.spyOn(prisma.membreRecord, 'findMany').mockResolvedValueOnce([])

    // WHEN
    const verification = await verifierDroitsLieu('42', { action: 'modifier', reserveAuxBetaTesteurs: false })

    // THEN
    expect(verification.statut).toBe('ok')
    expect(PrismaUtilisateurLoader.prototype.findById).not.toHaveBeenCalled()
  })

  it('refuse un utilisateur non bêta-testeur quand l’action y est réservée, sans charger le lieu', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: false })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer')

    // WHEN
    const verification = await verifierDroitsLieu('42', { action: 'supprimer', reserveAuxBetaTesteurs: true })

    // THEN
    expect(verification).toStrictEqual({ message: 'Action réservée aux bêta-testeurs', statut: 'refus' })
    expect(PrismaRecupererLieuDetailsLoader.prototype.recuperer).not.toHaveBeenCalled()
  })

  it('refuse quand le lieu est introuvable', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce({
      message: 'Lieu non trouvé',
      type: 'error',
    })

    // WHEN
    const verification = await verifierDroitsLieu('42', { action: 'modifier', reserveAuxBetaTesteurs: false })

    // THEN
    expect(verification).toStrictEqual({ message: 'Lieu non trouvé', statut: 'refus' })
  })

  it('refuse un lieu géré dans la Coop, même à un administrateur, avant toute vérification de droits (#1951)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory({ estLieuCoop: true })
    )
    vi.spyOn(prisma.membreRecord, 'findMany')

    // WHEN
    const verification = await verifierDroitsLieu('42', { action: 'modifier', reserveAuxBetaTesteurs: false })

    // THEN
    expect(verification).toStrictEqual({ message: MESSAGE_LIEU_GERE_PAR_LA_COOP, statut: 'refus' })
    expect(MESSAGE_LIEU_GERE_PAR_LA_COOP).toBe(
      'Ce lieu est géré dans la Coop numérique : il ne peut pas être modifié depuis Mon Inclusion Numérique.'
    )
    expect(prisma.membreRecord.findMany).not.toHaveBeenCalled()
  })

  it.each([
    { action: 'modifier' as const, message: "Vous n'avez pas les droits pour modifier ce lieu" },
    { action: 'supprimer' as const, message: "Vous n'avez pas les droits pour supprimer ce lieu" },
  ])(
    'refuse un gestionnaire hors de son département avec le message de l’action « $action »',
    async ({ action, message }) => {
      // GIVEN
      vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
      vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
        utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
      )
      vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
        lieuDetailsReadModelFactory({ codeDepartement: '93' })
      )
      vi.spyOn(prisma.membreRecord, 'findMany').mockResolvedValueOnce([])

      // WHEN
      const verification = await verifierDroitsLieu('42', { action, reserveAuxBetaTesteurs: false })

      // THEN
      expect(verification).toStrictEqual({ message, statut: 'refus' })
    }
  )
})
