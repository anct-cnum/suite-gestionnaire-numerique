import { describe, expect, it } from 'vitest'

import { verifierDroitsCreationLieu } from './verifierDroitsCreationLieu'
import { utilisateurFactory } from '@/domain/testHelper'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'

describe('vérifier les droits de création d’un lieu d’inclusion (helper des actions)', () => {
  it('autorise un administrateur dispositif, sans consulter le flag bêta (#1495)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById')
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )

    // WHEN
    const verification = await verifierDroitsCreationLieu()

    // THEN
    expect(verification).toStrictEqual({ statut: 'ok' })
    expect(PrismaUtilisateurLoader.prototype.findById).not.toHaveBeenCalled()
  })

  it.each([
    { role: 'Gestionnaire département' as const },
    { role: 'Gestionnaire structure' as const },
    { role: 'Gestionnaire région' as const },
  ])('refuse un $role : la création est réservée aux administrateurs', async ({ role }) => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ codeOrganisation: '75', role })
    )

    // WHEN
    const verification = await verifierDroitsCreationLieu()

    // THEN
    expect(verification).toStrictEqual({ message: "Vous n'avez pas les droits pour créer un lieu", statut: 'refus' })
  })
})
