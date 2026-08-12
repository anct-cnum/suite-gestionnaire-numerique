import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaStructureLabellisationRepository } from './PrismaStructureLabellisationRepository'
import { creerUneStructure, creerUnUtilisateur } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

describe('structure labellisation repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('attester enregistre l’attestation de la structure par l’utilisateur', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901, identifiantEtablissement: '79227291600034', nom: 'La Voie Du Num' })
    await creerUnUtilisateur({ id: 7 })

    // WHEN
    await new PrismaStructureLabellisationRepository().attester({
      dateAttestation: epochTime,
      structureId: 4901,
      utilisateurId: 7,
    })

    // THEN
    const attestations = await prisma.main_conum_labellisation.findMany({
      select: { date_attestation: true, structure_id: true, utilisateur_id: true },
    })
    expect(attestations).toStrictEqual([
      {
        date_attestation: epochTime,
        structure_id: 4901,
        utilisateur_id: 7,
      },
    ])
  })

  it('un renouvellement insère une nouvelle attestation sans modifier l’historique', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901, identifiantEtablissement: '79227291600034', nom: 'La Voie Du Num' })
    await creerUnUtilisateur({ id: 7 })
    const repository = new PrismaStructureLabellisationRepository()
    await repository.attester({ dateAttestation: epochTime, structureId: 4901, utilisateurId: 7 })

    // WHEN
    await repository.attester({ dateAttestation: epochTimePlusOneDay, structureId: 4901, utilisateurId: 7 })

    // THEN
    const attestations = await prisma.main_conum_labellisation.findMany({
      orderBy: { date_attestation: 'asc' },
    })
    expect(attestations).toHaveLength(2)
    expect(attestations[0].date_attestation).toStrictEqual(epochTime)
    expect(attestations[1].date_attestation).toStrictEqual(epochTimePlusOneDay)
  })

  it('la dernière attestation est null quand la structure n’a jamais été labellisée', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901, identifiantEtablissement: '79227291600034', nom: 'La Voie Du Num' })

    // WHEN
    const derniereAttestation = await new PrismaStructureLabellisationRepository().derniereAttestation(4901)

    // THEN
    expect(derniereAttestation).toBeNull()
  })

  it('la dernière attestation est la plus récente de la structure', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901, identifiantEtablissement: '79227291600034', nom: 'La Voie Du Num' })
    await creerUnUtilisateur({ id: 7 })
    const repository = new PrismaStructureLabellisationRepository()
    await repository.attester({ dateAttestation: epochTime, structureId: 4901, utilisateurId: 7 })
    await repository.attester({ dateAttestation: epochTimePlusOneDay, structureId: 4901, utilisateurId: 7 })

    // WHEN
    const derniereAttestation = await repository.derniereAttestation(4901)

    // THEN
    expect(derniereAttestation).toStrictEqual(epochTimePlusOneDay)
  })
})
