import { describe, expect, it } from 'vitest'

import { MESSAGE_LIEU_GERE_PAR_LA_COOP, verifierDroitsLieu } from './verifierDroitsLieu'
import { utilisateurFactory } from '@/domain/testHelper'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
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

    // WHEN
    const verification = await verifierDroitsLieu('42', { action: 'modifier', reserveAuxBetaTesteurs: false })

    // THEN
    expect(verification.statut).toBe('ok')
    expect(PrismaUtilisateurLoader.prototype.findById).not.toHaveBeenCalled()
  })

  it('laisse passer un administrateur dispositif hors bêta quand l’action est en ouverture progressive (#1951)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: false })
    )
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory()
    )

    // WHEN
    const verification = await verifierDroitsLieu('42', { action: 'supprimer', reserveAuxBetaTesteurs: true })

    // THEN
    expect(verification.statut).toBe('ok')
  })

  it('refuse un gestionnaire hors bêta quand l’action est en ouverture progressive, sans charger le lieu', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: false, role: roleGestionnaireDepartement })
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
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId')

    // WHEN
    const verification = await verifierDroitsLieu('42', { action: 'modifier', reserveAuxBetaTesteurs: false })

    // THEN
    expect(verification).toStrictEqual({ message: MESSAGE_LIEU_GERE_PAR_LA_COOP, statut: 'refus' })
    expect(MESSAGE_LIEU_GERE_PAR_LA_COOP).toBe(
      'Ce lieu est géré dans la Coop numérique : il ne peut pas être modifié depuis Mon Inclusion Numérique.'
    )
    expect(PrismaMembreLoader.prototype.getToutesAppartenancesParStructureId).not.toHaveBeenCalled()
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

      // WHEN
      const verification = await verifierDroitsLieu('42', { action, reserveAuxBetaTesteurs: false })

      // THEN
      expect(verification).toStrictEqual({ message, statut: 'refus' })
    }
  )

  it('refuse un gestionnaire d’une autre structure dont la structure n’est membre d’aucune gouvernance, même si la structure du lieu l’est (#1979)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ codeOrganisation: '999', role: 'Gestionnaire structure' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory({ codeDepartement: '75', structureId: 42 })
    )
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValueOnce([])

    // WHEN
    const verification = await verifierDroitsLieu('42', { action: 'modifier', reserveAuxBetaTesteurs: false })

    // THEN
    expect(verification).toStrictEqual({ message: "Vous n'avez pas les droits pour modifier ce lieu", statut: 'refus' })
    expect(PrismaMembreLoader.prototype.getToutesAppartenancesParStructureId).toHaveBeenCalledWith(999)
    expect(PrismaMembreLoader.prototype.getToutesAppartenancesParStructureId).not.toHaveBeenCalledWith(42)
  })

  it('autorise un gestionnaire dont la structure est membre d’une gouvernance du département du lieu', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ codeOrganisation: '999', role: 'Gestionnaire structure' })
    )
    const lieu = lieuDetailsReadModelFactory({ codeDepartement: '75', structureId: 42 })
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(lieu)
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValueOnce([
      { codeDepartement: '75', estCoporteur: false },
    ])

    // WHEN
    const verification = await verifierDroitsLieu('42', { action: 'modifier', reserveAuxBetaTesteurs: false })

    // THEN
    expect(verification).toStrictEqual({ lieu, statut: 'ok' })
  })

  it('ne consulte pas les appartenances de gouvernance pour un gestionnaire département', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory({ codeDepartement: '75' })
    )
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId')

    // WHEN
    const verification = await verifierDroitsLieu('42', { action: 'modifier', reserveAuxBetaTesteurs: false })

    // THEN
    expect(verification.statut).toBe('ok')
    expect(PrismaMembreLoader.prototype.getToutesAppartenancesParStructureId).not.toHaveBeenCalled()
  })
})

const roleGestionnaireDepartement = {
  ...utilisateurReadModelFactory().role,
  nom: 'Gestionnaire département',
  type: 'gestionnaire_departement' as const,
}
