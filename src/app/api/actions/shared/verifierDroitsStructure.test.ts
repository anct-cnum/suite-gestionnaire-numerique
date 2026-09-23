import { describe, expect, it } from 'vitest'

import { MESSAGE_DROITS_STRUCTURE_INSUFFISANTS, verifierDroitsStructure } from './verifierDroitsStructure'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('vérifier les droits sur une structure (helper des actions)', () => {
  it('autorise un administrateur dispositif sur n’importe quelle structure', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValue([])

    // WHEN
    const verification = await verifierDroitsStructure(978)

    // THEN
    expect(verification).toStrictEqual({ statut: 'ok' })
  })

  it('autorise un gestionnaire structure sur sa propre structure', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ role: roleGestionnaireStructure, structureId: 978 })
    )
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValue([])

    // WHEN
    const verification = await verifierDroitsStructure(978)

    // THEN
    expect(verification).toStrictEqual({ statut: 'ok' })
  })

  it('refuse un gestionnaire structure sur une structure qui n’est pas la sienne, même membre d’une gouvernance', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ role: roleGestionnaireStructure, structureId: 999 })
    )
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId')
      // appartenances de la structure du demandeur (999) : aucune
      .mockResolvedValueOnce([])
      // appartenances de la structure visée (978) : membre de la gouvernance 93
      .mockResolvedValueOnce([{ codeDepartement: '93', estCoporteur: false }])

    // WHEN
    const verification = await verifierDroitsStructure(978)

    // THEN
    expect(verification).toStrictEqual({ message: MESSAGE_DROITS_STRUCTURE_INSUFFISANTS, statut: 'refus' })
  })

  it('autorise un gestionnaire structure coporteur d’une gouvernance sur une structure membre de cette gouvernance', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ role: roleGestionnaireStructure, structureId: 999 })
    )
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId')
      .mockResolvedValueOnce([{ codeDepartement: '93', estCoporteur: true }])
      .mockResolvedValueOnce([{ codeDepartement: '93', estCoporteur: false }])

    // WHEN
    const verification = await verifierDroitsStructure(978)

    // THEN
    expect(verification).toStrictEqual({ statut: 'ok' })
  })

  it('autorise un gestionnaire département quand la structure est membre confirmé d’une gouvernance de son département', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ departementCode: '93', role: roleGestionnaireDepartement })
    )
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValueOnce([
      { codeDepartement: '93', estCoporteur: false },
    ])

    // WHEN
    const verification = await verifierDroitsStructure(978)

    // THEN
    expect(verification).toStrictEqual({ statut: 'ok' })
    expect(PrismaMembreLoader.prototype.getToutesAppartenancesParStructureId).toHaveBeenCalledWith(978)
  })

  it('refuse un gestionnaire département quand la structure ne relève d’aucune gouvernance de son département', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ departementCode: '75', role: roleGestionnaireDepartement })
    )
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValueOnce([
      { codeDepartement: '93', estCoporteur: false },
    ])

    // WHEN
    const verification = await verifierDroitsStructure(978)

    // THEN
    expect(verification).toStrictEqual({ message: MESSAGE_DROITS_STRUCTURE_INSUFFISANTS, statut: 'refus' })
  })
})

const roleGestionnaireStructure = {
  ...utilisateurReadModelFactory().role,
  nom: 'Gestionnaire structure',
  type: 'gestionnaire_structure' as const,
}

const roleGestionnaireDepartement = {
  ...utilisateurReadModelFactory().role,
  nom: 'Gestionnaire département',
  type: 'gestionnaire_departement' as const,
}
