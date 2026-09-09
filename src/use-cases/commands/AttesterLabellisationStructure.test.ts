import { describe, expect, it, vi } from 'vitest'

import {
  AttesterLabellisationStructure,
  EmailConfirmationLabellisationGateway,
  StructureLabellisationRepository,
} from './AttesterLabellisationStructure'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

describe('attester la labellisation d’une structure', () => {
  it('enregistre une attestation datée pour la structure et l’utilisateur quand elle n’a jamais été labellisée', async () => {
    // GIVEN
    const repository = repositoryStub(null)
    const emailGateway = emailGatewayStub()

    // WHEN
    const result = await new AttesterLabellisationStructure(repository, emailGateway, epochTime).handle({
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

  it('envoie l’email de confirmation avec la date de renouvellement (trois mois) après l’enregistrement de l’attestation', async () => {
    // GIVEN
    const repository = repositoryStub(null)
    const emailGateway = emailGatewayStub()
    const troisMoisApres = new Date(epochTime)
    troisMoisApres.setMonth(troisMoisApres.getMonth() + 3)

    // WHEN
    const result = await new AttesterLabellisationStructure(repository, emailGateway, epochTime).handle({
      structureId: 978,
      utilisateurId: 7,
    })

    // THEN
    expect(result).toBe('OK')
    expect(emailGateway.envoyer).toHaveBeenCalledWith({
      dateRenouvellement: troisMoisApres,
      structureId: 978,
    })
  })

  it('refuse une nouvelle attestation sans envoyer d’email quand le label est encore actif (moins de trois mois)', async () => {
    // GIVEN
    const repository = repositoryStub(epochTime)
    const emailGateway = emailGatewayStub()

    // WHEN
    const result = await new AttesterLabellisationStructure(repository, emailGateway, epochTimePlusOneDay).handle({
      structureId: 978,
      utilisateurId: 7,
    })

    // THEN
    expect(result).toBe('dejaLabellisee')
    expect(repository.attester).not.toHaveBeenCalled()
    expect(emailGateway.envoyer).not.toHaveBeenCalled()
  })

  it('accepte le renouvellement quand le label a expiré (trois mois ou plus)', async () => {
    // GIVEN
    const repository = repositoryStub(epochTime)
    const emailGateway = emailGatewayStub()
    const troisMoisApres = new Date(epochTime)
    troisMoisApres.setMonth(troisMoisApres.getMonth() + 3)

    // WHEN
    const result = await new AttesterLabellisationStructure(repository, emailGateway, troisMoisApres).handle({
      structureId: 978,
      utilisateurId: 7,
    })

    // THEN
    expect(result).toBe('OK')
    expect(repository.attester).toHaveBeenCalledWith({
      dateAttestation: troisMoisApres,
      structureId: 978,
      utilisateurId: 7,
    })
  })
})

function emailGatewayStub(): EmailConfirmationLabellisationGateway {
  return {
    envoyer: vi.fn<EmailConfirmationLabellisationGateway['envoyer']>().mockResolvedValueOnce(undefined),
  }
}

function repositoryStub(derniereAttestation: Date | null): StructureLabellisationRepository {
  return {
    attester: vi.fn<StructureLabellisationRepository['attester']>().mockResolvedValueOnce(undefined),
    derniereAttestation: vi
      .fn<StructureLabellisationRepository['derniereAttestation']>()
      .mockResolvedValueOnce(derniereAttestation),
  }
}
