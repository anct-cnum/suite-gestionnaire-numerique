import { describe, expect, it, vi } from 'vitest'

import { AttesterLabellisationStructure, StructureLabellisationRepository } from './AttesterLabellisationStructure'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

describe('attester la labellisation d’une structure', () => {
  it('enregistre une attestation datée pour la structure et l’utilisateur quand elle n’a jamais été labellisée', async () => {
    // GIVEN
    const repository = repositoryStub(null)

    // WHEN
    const result = await new AttesterLabellisationStructure(repository, epochTime).handle({
      structureId: 978,
      utilisateurId: 7,
    })

    // THEN
    expect(result).toBe('OK')
    expect(repository.attester).toHaveBeenCalledWith({
      dateAttestation: epochTime,
      structureId: 978,
      utilisateurId: 7,
    })
  })

  it('refuse une nouvelle attestation quand le label est encore actif (moins d’un an)', async () => {
    // GIVEN
    const repository = repositoryStub(epochTime)

    // WHEN
    const result = await new AttesterLabellisationStructure(repository, epochTimePlusOneDay).handle({
      structureId: 978,
      utilisateurId: 7,
    })

    // THEN
    expect(result).toBe('dejaLabellisee')
    expect(repository.attester).not.toHaveBeenCalled()
  })

  it('accepte le renouvellement quand le label a expiré (un an ou plus)', async () => {
    // GIVEN
    const repository = repositoryStub(epochTime)
    const unAnApres = new Date(epochTime)
    unAnApres.setFullYear(unAnApres.getFullYear() + 1)

    // WHEN
    const result = await new AttesterLabellisationStructure(repository, unAnApres).handle({
      structureId: 978,
      utilisateurId: 7,
    })

    // THEN
    expect(result).toBe('OK')
    expect(repository.attester).toHaveBeenCalledWith({
      dateAttestation: unAnApres,
      structureId: 978,
      utilisateurId: 7,
    })
  })
})

function repositoryStub(derniereAttestation: Date | null): StructureLabellisationRepository {
  return {
    attester: vi.fn<StructureLabellisationRepository['attester']>().mockResolvedValueOnce(undefined),
    derniereAttestation: vi
      .fn<StructureLabellisationRepository['derniereAttestation']>()
      .mockResolvedValueOnce(derniereAttestation),
  }
}
