import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { ajouterContactStructureAction } from './ajouterContactStructureAction'
import { MESSAGE_DROITS_STRUCTURE_INSUFFISANTS } from './shared/verifierDroitsStructure'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructureRepository } from '@/gateways/PrismaStructureRepository'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('ajouter un contact de structure action', () => {
  it('ajoute le contact et purge le cache quand l’utilisateur peut gérer la structure', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValue([])
    vi.spyOn(PrismaStructureRepository.prototype, 'ajouterContact').mockResolvedValueOnce()
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await ajouterContactStructureAction(actionParams)

    // THEN
    expect(PrismaStructureRepository.prototype.ajouterContact).toHaveBeenCalledWith(978, {
      email: 'michel.tartempion@example.net',
      estReferentFNE: true,
      fonction: 'Directeur',
      nom: 'Tartempion',
      prenom: 'Michel',
      telephone: '0102030405',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/structure/978')
    expect(messages).toStrictEqual(['OK'])
  })

  it('refuse sans écrire quand l’utilisateur ne peut pas gérer la structure', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ role: roleGestionnaireStructure, structureId: 999 })
    )
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValue([])
    vi.spyOn(PrismaStructureRepository.prototype, 'ajouterContact')

    // WHEN
    const messages = await ajouterContactStructureAction(actionParams)

    // THEN
    expect(messages).toStrictEqual([MESSAGE_DROITS_STRUCTURE_INSUFFISANTS])
    expect(PrismaStructureRepository.prototype.ajouterContact).not.toHaveBeenCalled()
  })

  it('renvoie une erreur de validation sans consulter la session quand l’email est invalide', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId')

    // WHEN
    const messages = await ajouterContactStructureAction({ ...actionParams, email: 'pas-un-email' })

    // THEN
    expect(messages).toStrictEqual(["L'adresse électronique doit être valide"])
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })
})

const actionParams = {
  email: 'michel.tartempion@example.net',
  estReferentFNE: true,
  fonction: 'Directeur',
  nom: 'Tartempion',
  path: '/structure/978',
  prenom: 'Michel',
  structureId: 978,
  telephone: '0102030405',
}

const roleGestionnaireStructure = {
  ...utilisateurReadModelFactory().role,
  nom: 'Gestionnaire structure',
  type: 'gestionnaire_structure' as const,
}
