import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { MESSAGE_CONTACT_HORS_STRUCTURE, MESSAGE_DROITS_STRUCTURE_INSUFFISANTS } from './shared/verifierDroitsStructure'
import { supprimerContactStructureAction } from './supprimerContactStructureAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructureRepository } from '@/gateways/PrismaStructureRepository'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('supprimer un contact de structure action', () => {
  it('supprime le contact borné à la structure et purge le cache quand l’utilisateur peut gérer la structure', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValue([])
    vi.spyOn(PrismaStructureRepository.prototype, 'supprimerContact').mockResolvedValueOnce(true)
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await supprimerContactStructureAction(actionParams)

    // THEN
    expect(PrismaStructureRepository.prototype.supprimerContact).toHaveBeenCalledWith(978, 12)
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/structure/978')
    expect(messages).toStrictEqual(['OK'])
  })

  it('signale un contact qui n’appartient pas à la structure sans purger le cache', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValue([])
    vi.spyOn(PrismaStructureRepository.prototype, 'supprimerContact').mockResolvedValueOnce(false)
    vi.spyOn(nextCache, 'revalidatePath')

    // WHEN
    const messages = await supprimerContactStructureAction(actionParams)

    // THEN
    expect(messages).toStrictEqual([MESSAGE_CONTACT_HORS_STRUCTURE])
    expect(nextCache.revalidatePath).not.toHaveBeenCalled()
  })

  it('refuse sans écrire quand l’utilisateur ne peut pas gérer la structure', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ role: roleGestionnaireStructure, structureId: 999 })
    )
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValue([])
    vi.spyOn(PrismaStructureRepository.prototype, 'supprimerContact')

    // WHEN
    const messages = await supprimerContactStructureAction(actionParams)

    // THEN
    expect(messages).toStrictEqual([MESSAGE_DROITS_STRUCTURE_INSUFFISANTS])
    expect(PrismaStructureRepository.prototype.supprimerContact).not.toHaveBeenCalled()
  })

  it('renvoie une erreur de validation sans consulter la session quand l’identifiant de structure est invalide', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId')

    // WHEN
    const messages = await supprimerContactStructureAction({ ...actionParams, structureId: -1 })

    // THEN
    expect(messages).toStrictEqual(["L'identifiant de la structure doit être un entier positif"])
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })
})

const actionParams = {
  contactId: 12,
  path: '/structure/978',
  structureId: 978,
}

const roleGestionnaireStructure = {
  ...utilisateurReadModelFactory().role,
  nom: 'Gestionnaire structure',
  type: 'gestionnaire_structure' as const,
}
