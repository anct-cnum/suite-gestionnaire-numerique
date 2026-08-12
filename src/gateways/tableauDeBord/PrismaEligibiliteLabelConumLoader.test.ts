import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaEligibiliteLabelConumLoader } from './PrismaEligibiliteLabelConumLoader'
import prisma from '../../../prisma/prismaClient'
import { creerUneStructure, creerUnUtilisateur } from '../testHelper'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

describe('éligibilité label conum loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('une structure ayant reçu au moins un poste conum, même rendu, est éligible', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901 })
    await prisma.poste.create({
      data: {
        date_attribution: epochTime,
        date_rendu_poste: epochTime,
        poste_conum_id: 1,
        structure_id: 4901,
      },
    })

    // WHEN
    const estEligible = await new PrismaEligibiliteLabelConumLoader().estEligible(4901)

    // THEN
    expect(estEligible).toBe(true)
  })

  it('une structure n’ayant jamais reçu de poste conum n’est pas éligible', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901 })

    // WHEN
    const estEligible = await new PrismaEligibiliteLabelConumLoader().estEligible(4901)

    // THEN
    expect(estEligible).toBe(false)
  })

  it('la date de l’attestation la plus récente est retournée quand la structure est labellisée', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901 })
    await creerUnUtilisateur({ id: 7 })
    await prisma.main_conum_labellisation.create({
      data: { date_attestation: epochTime, structure_id: 4901, utilisateur_id: 7 },
    })
    await prisma.main_conum_labellisation.create({
      data: { date_attestation: epochTimePlusOneDay, structure_id: 4901, utilisateur_id: 7 },
    })

    // WHEN
    const derniereAttestation = await new PrismaEligibiliteLabelConumLoader().derniereAttestation(4901)

    // THEN
    expect(derniereAttestation).toStrictEqual(epochTimePlusOneDay)
  })

  it('aucune date n’est retournée quand la structure n’a jamais été labellisée', async () => {
    // GIVEN
    await creerUneStructure({ id: 4901 })

    // WHEN
    const derniereAttestation = await new PrismaEligibiliteLabelConumLoader().derniereAttestation(4901)

    // THEN
    expect(derniereAttestation).toBeNull()
  })
})
