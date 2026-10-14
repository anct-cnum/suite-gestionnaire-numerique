import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { modifierContactStructureAction } from './modifierContactStructureAction'
import { MESSAGE_CONTACT_HORS_STRUCTURE, MESSAGE_DROITS_STRUCTURE_INSUFFISANTS } from './shared/verifierDroitsStructure'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructureRepository } from '@/gateways/PrismaStructureRepository'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('modifier un contact de structure action', () => {
  it('modifie le contact borné à la structure et purge le cache quand l’utilisateur peut gérer la structure', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValue([])
    vi.spyOn(PrismaStructureRepository.prototype, 'modifierContact').mockResolvedValueOnce(true)
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await modifierContactStructureAction(actionParams)

    // THEN
    expect(PrismaStructureRepository.prototype.modifierContact).toHaveBeenCalledWith(978, 12, {
      email: 'michel.tartempion@example.net',
      estReferentFNE: false,
      fonction: 'Directeur',
      nom: 'Tartempion',
      prenom: 'Michel',
      telephone: '',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/structure/978')
    expect(messages).toStrictEqual(['OK'])
  })

  it('signale un contact qui n’appartient pas à la structure sans purger le cache', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValue([])
    vi.spyOn(PrismaStructureRepository.prototype, 'modifierContact').mockResolvedValueOnce(false)
    vi.spyOn(nextCache, 'revalidatePath')

    // WHEN
    const messages = await modifierContactStructureAction(actionParams)

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
    vi.spyOn(PrismaStructureRepository.prototype, 'modifierContact')

    // WHEN
    const messages = await modifierContactStructureAction(actionParams)

    // THEN
    expect(messages).toStrictEqual([MESSAGE_DROITS_STRUCTURE_INSUFFISANTS])
    expect(PrismaStructureRepository.prototype.modifierContact).not.toHaveBeenCalled()
  })

  it('renvoie une erreur de validation sans consulter la session quand l’identifiant du contact est invalide', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId')

    // WHEN
    const messages = await modifierContactStructureAction({ ...actionParams, contactId: 0 })

    // THEN
    expect(messages).toStrictEqual(["L'identifiant du contact doit être un entier positif"])
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })
})

const actionParams = {
  contactId: 12,
  email: 'michel.tartempion@example.net',
  estReferentFNE: false,
  fonction: 'Directeur',
  nom: 'Tartempion',
  path: '/structure/978',
  prenom: 'Michel',
  structureId: 978,
  telephone: '',
}

const roleGestionnaireStructure = {
  ...utilisateurReadModelFactory().role,
  nom: 'Gestionnaire structure',
  type: 'gestionnaire_structure' as const,
}
