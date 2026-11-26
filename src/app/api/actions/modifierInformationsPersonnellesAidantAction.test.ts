import { describe, expect, it } from 'vitest'

import { modifierInformationsPersonnellesAidantAction } from './modifierInformationsPersonnellesAidantAction'
import PrismaAidantDetailsLoader from '@/gateways/AidantDetailsLoader'
import { PrismaAidantRepository } from '@/gateways/PrismaAidantRepository'
import { AidantDetailsReadModel } from '@/use-cases/queries/RecupererAidantDetails'

describe('modifier les informations personnelles d’un aidant action', () => {
  it('laisse remonter une erreur technique, pour qu’elle soit signalée à Sentry (#2390)', async () => {
    // GIVEN un aidant sans structure employeuse : aucun contrôle de périmètre à faire.
    vi.spyOn(PrismaAidantDetailsLoader.prototype, 'findById').mockResolvedValueOnce({
      codeDepartementEmployeur: null,
      structureEmployeuseId: null,
    } as AidantDetailsReadModel)
    vi.spyOn(PrismaAidantRepository.prototype, 'modifierInformationsPersonnelles').mockRejectedValueOnce(
      new Error('connexion à la base perdue')
    )

    // WHEN
    const messages = modifierInformationsPersonnellesAidantAction({
      aidantId: 42,
      emails: 'aidant@example.com',
      nom: 'Tartempion',
      path: '/aidant/42',
      prenom: 'Martin',
      telephone: '',
    })

    // THEN
    await expect(messages).rejects.toThrow('connexion à la base perdue')
  })
})
