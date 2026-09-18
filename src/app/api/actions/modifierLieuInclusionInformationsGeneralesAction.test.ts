import { describe, expect, it } from 'vitest'

import { modifierLieuInclusionInformationsGeneralesAction } from './modifierLieuInclusionInformationsGeneralesAction'
import { MESSAGE_LIEU_GERE_PAR_LA_COOP } from './shared/verifierDroitsLieu'
import { utilisateurFactory } from '@/domain/testHelper'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ModifierLieuInclusionInformationsGenerales } from '@/use-cases/commands/ModifierLieuInclusionInformationsGenerales'
import { lieuDetailsReadModelFactory, utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('modifier les informations générales d’un lieu d’inclusion action', () => {
  it('renvoie une erreur de validation quand le SIRET est mal formé', async () => {
    // WHEN
    const messages = await modifierLieuInclusionInformationsGeneralesAction({
      path: '/lieu/42',
      siret: '12AB',
      structureId: '42',
    })

    // THEN
    expect(messages).toStrictEqual(['Format invalide : saisissez 6-7 chiffres (RIDET) ou 14 chiffres (SIRET)'])
  })

  it('refuse l’action à un gestionnaire non bêta-testeur (ouverture progressive, #1951)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({
        isBetaTesteur: false,
        role: {
          ...utilisateurReadModelFactory().role,
          nom: 'Gestionnaire département',
          type: 'gestionnaire_departement',
        },
      })
    )

    // WHEN
    const messages = await modifierLieuInclusionInformationsGeneralesAction({
      nom: 'Nouveau nom',
      path: '/lieu/42',
      structureId: '42',
    })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux bêta-testeurs'])
  })

  it('refuse de modifier un lieu géré dans la Coop, sans consulter l’API Entreprise ni le use case (#1951)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory({ estLieuCoop: true })
    )
    vi.spyOn(ModifierLieuInclusionInformationsGenerales.prototype, 'handle')

    // WHEN
    const messages = await modifierLieuInclusionInformationsGeneralesAction({
      path: '/lieu/42',
      siret: '12345678901234',
      structureId: '42',
      typologies: ['ASSO'],
    })

    // THEN
    expect(messages).toStrictEqual([MESSAGE_LIEU_GERE_PAR_LA_COOP])
    expect(ModifierLieuInclusionInformationsGenerales.prototype.handle).not.toHaveBeenCalled()
  })
})
