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

  // La garde manquait côté serveur : seule la règle « administrateur » fermait l'action. En
  // ouvrant la règle, c'est cette porte qui tient la fonctionnalité pendant la recette (#2226).
  it.each([
    { nom: 'Gestionnaire département' as const, type: 'gestionnaire_departement' as const },
    { nom: 'Gestionnaire région' as const, type: 'gestionnaire_region' as const },
    { nom: 'Gestionnaire structure' as const, type: 'gestionnaire_structure' as const },
  ])('refuse un $nom hors du périmètre bêta (#2226)', async (role) => {
    // GIVEN
    connecte({ isBetaTesteur: false, role })

    // WHEN
    const verification = await verifierDroitsCreationLieu()

    // THEN
    expect(verification).toStrictEqual({ message: 'Action réservée aux bêta-testeurs', statut: 'refus' })
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
