import { describe, expect, it } from 'vitest'

import { verifierDroitsCreationLieu } from './verifierDroitsCreationLieu'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { RoleUtilisateur } from '@/use-cases/queries/shared/UnUtilisateurReadModel'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('vérifier les droits de création d’un lieu d’inclusion (helper des actions)', () => {
  it.each([
    { nom: 'Gestionnaire département' as const, type: 'gestionnaire_departement' as const },
    { nom: 'Gestionnaire région' as const, type: 'gestionnaire_region' as const },
    { nom: 'Gestionnaire structure' as const, type: 'gestionnaire_structure' as const },
  ])('autorise un $nom bêta-testeur : la création n’est plus réservée aux administrateurs (#2226)', async (role) => {
    // GIVEN
    connecte({ isBetaTesteur: true, role })

    // WHEN
    const verification = await verifierDroitsCreationLieu()

    // THEN
    expect(verification).toStrictEqual({ statut: 'ok' })
  })

  it('autorise un administrateur dispositif, que le flag bêta soit posé ou non (#2226)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: false })
    )

    // WHEN
    const verification = await verifierDroitsCreationLieu()

    // THEN
    expect(verification).toStrictEqual({ statut: 'ok' })
  })

  // La porte bêta qui tenait la fonctionnalité pendant la recette est ouverte (#1716) : le
  // flag n'est plus consulté, tous les rôles de gestion peuvent créer un lieu.
  it.each([
    { nom: 'Gestionnaire département' as const, type: 'gestionnaire_departement' as const },
    { nom: 'Gestionnaire groupement' as const, type: 'gestionnaire_groupement' as const },
    { nom: 'Gestionnaire région' as const, type: 'gestionnaire_region' as const },
    { nom: 'Gestionnaire structure' as const, type: 'gestionnaire_structure' as const },
  ])('autorise un $nom hors bêta (#1716)', async (role) => {
    // GIVEN
    connecte({ isBetaTesteur: false, role })

    // WHEN
    const verification = await verifierDroitsCreationLieu()

    // THEN
    expect(verification).toStrictEqual({ statut: 'ok' })
  })
})

function connecte({
  isBetaTesteur,
  role,
}: Readonly<{
  isBetaTesteur: boolean
  role: Readonly<{ nom: string; type: RoleUtilisateur }>
}>): void {
  vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
  vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
    utilisateurReadModelFactory({
      departementCode: '75',
      isBetaTesteur,
      regionCode: '84',
      role: { ...utilisateurReadModelFactory().role, ...role },
      structureId: 42,
    })
  )
}
