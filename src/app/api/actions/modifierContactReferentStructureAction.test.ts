import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { modifierContactReferentStructureAction } from './modifierContactReferentStructureAction'
import { MESSAGE_DROITS_STRUCTURE_INSUFFISANTS } from './shared/verifierDroitsStructure'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { ModifierContactReferentStructure } from '@/use-cases/commands/ModifierContactReferentStructure'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('modifier le contact référent d’une structure action', () => {
  it('modifie le contact référent et purge le cache quand l’utilisateur peut gérer la structure', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValue([])
    vi.spyOn(ModifierContactReferentStructure.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await modifierContactReferentStructureAction(actionParams)

    // THEN
    expect(ModifierContactReferentStructure.prototype.handle).toHaveBeenCalledWith({
      contactReferent: {
        email: 'michel.tartempion@example.net',
        fonction: 'Directeur',
        nom: 'Tartempion',
        prenom: 'Michel',
        telephone: '0102030405',
      },
      structureId: 978,
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
    vi.spyOn(ModifierContactReferentStructure.prototype, 'handle')

    // WHEN
    const messages = await modifierContactReferentStructureAction(actionParams)

    // THEN
    expect(messages).toStrictEqual([MESSAGE_DROITS_STRUCTURE_INSUFFISANTS])
    expect(ModifierContactReferentStructure.prototype.handle).not.toHaveBeenCalled()
  })

  it('renvoie une erreur de validation sans consulter la session quand le téléphone est invalide', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId')

    // WHEN
    const messages = await modifierContactReferentStructureAction({ ...actionParams, telephone: '12' })

    // THEN
    expect(messages).toStrictEqual(['Le téléphone doit être au format 0102030405 ou +33102030405'])
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })
})

const actionParams = {
  email: 'michel.tartempion@example.net',
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
