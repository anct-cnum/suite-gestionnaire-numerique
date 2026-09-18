import { afterEach, describe, expect, it } from 'vitest'

import { PrismaListeLieuxInclusionLoader } from './PrismaListeLieuxInclusionLoader'
import prisma from '../../prisma/prismaClient'

const LIEU_COOP_ID = 991883
const LIEU_MEDNUM_ID = 991884
const NOM = 'Lieu test liste coop 1951'

describe('liste des lieux d’inclusion (loader Prisma)', () => {
  afterEach(async () => {
    await prisma.main_lieu_inclusion.deleteMany({ where: { id: { in: [LIEU_COOP_ID, LIEU_MEDNUM_ID] } } })
  })

  it('expose structure_coop_id sur chaque ligne pour distinguer les lieux gérés dans la Coop (#1951)', async () => {
    // GIVEN
    await prisma.main_lieu_inclusion.createMany({
      data: [
        { id: LIEU_COOP_ID, nom: `${NOM} coop`, structure_coop_id: '00000000-0000-4000-8000-000000000002' },
        { id: LIEU_MEDNUM_ID, nom: `${NOM} mednum`, structure_coop_id: null },
      ],
    })

    // WHEN
    const readModel = await new PrismaListeLieuxInclusionLoader().getLieux({
      nom: NOM,
      pagination: { limite: 10, page: 0 },
      scopeFiltre: { type: 'national' },
      statut: 'actif',
    })

    // THEN
    expect(readModel).not.toHaveProperty('type')
    const parId = new Map(
      (readModel as { lieux: ReadonlyArray<{ id: string; structure_coop_id: null | string }> }).lieux.map((lieu) => [
        lieu.id,
        lieu.structure_coop_id,
      ])
    )
    expect(parId.get(String(LIEU_COOP_ID))).toBe('00000000-0000-4000-8000-000000000002')
    expect(parId.get(String(LIEU_MEDNUM_ID))).toBeNull()
  })
})
