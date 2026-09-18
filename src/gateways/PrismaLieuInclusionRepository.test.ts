import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaLieuInclusionRepository } from './PrismaLieuInclusionRepository'
import prisma from '../../prisma/prismaClient'
import { StructureUid } from '@/domain/Structure'
import { epochTime } from '@/shared/testHelper'

const LIEU_ID = 991882
const SOURCE_INITIALE = 'dora'

describe('repository Prisma des lieux d’inclusion', () => {
  beforeEach(async () => {
    await prisma.main_lieu_inclusion.create({
      data: {
        id: LIEU_ID,
        nom: 'Lieu test source',
        source: SOURCE_INITIALE,
        visible_pour_cartographie_nationale: true,
      },
    })
  })

  afterEach(async () => {
    await prisma.main_lieu_inclusion.deleteMany({ where: { id: LIEU_ID } })
  })

  it('une écriture de données signe la ligne : source MIN, éditeur min, date de modification MIN (#1951)', async () => {
    // WHEN
    await new PrismaLieuInclusionRepository().updateServicesTypePublic({
      date: epochTime,
      priseEnChargeSpecifique: [],
      publicsSpecifiquementAdresses: [],
      structureUid: new StructureUid(LIEU_ID),
    })

    // THEN
    const lieu = await prisma.main_lieu_inclusion.findUniqueOrThrow({ where: { id: LIEU_ID } })
    expect(lieu.source).toBe('Mon Inclusion Numérique')
    expect(lieu.edited_by).toBe('min')
    expect(lieu.updated_at_min).toStrictEqual(epochTime)
  })

  it('un changement de visibilité ne touche pas à la source : c’est un état, pas une donnée (#1951)', async () => {
    // WHEN
    await new PrismaLieuInclusionRepository().updateVisibiliteCartographie({
      date: epochTime,
      structureUid: new StructureUid(LIEU_ID),
      visiblePourCartographie: false,
    })

    // THEN
    const lieu = await prisma.main_lieu_inclusion.findUniqueOrThrow({ where: { id: LIEU_ID } })
    expect(lieu.visible_pour_cartographie_nationale).toBe(false)
    expect(lieu.source).toBe(SOURCE_INITIALE)
    expect(lieu.edited_by).toBe('min')
    expect(lieu.updated_at_min).toStrictEqual(epochTime)
  })

  it('une suppression ne touche pas à la source et masque le lieu (#1951)', async () => {
    // WHEN
    await new PrismaLieuInclusionRepository().supprimer({
      date: epochTime,
      structureUid: new StructureUid(LIEU_ID),
    })

    // THEN
    const lieu = await prisma.main_lieu_inclusion.findUniqueOrThrow({ where: { id: LIEU_ID } })
    expect(lieu.deleted_at).toStrictEqual(epochTime)
    expect(lieu.visible_pour_cartographie_nationale).toBe(false)
    expect(lieu.source).toBe(SOURCE_INITIALE)
    expect(lieu.edited_by).toBe('min')
  })
})
