import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaRattachementsStructureLoader } from './PrismaRattachementsStructureLoader'
import { creerUnContact, creerUneStructure } from './testHelper'
import prisma from '../../prisma/prismaClient'

describe('prisma rattachements structure loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('compte les éléments rattachés à la structure', async () => {
    // GIVEN
    await creerUneStructure({ id: 978 })
    const contactId = await creerUnContact({ email: 'referent@example.com' })
    await prisma.contact_structure_administrative.create({
      data: { contact_id: contactId, structure_administrative_id: 978 },
    })

    // WHEN
    const rattachements = await new PrismaRattachementsStructureLoader().compter(978)

    // THEN
    expect(rattachements).toStrictEqual({
      affectations: 0,
      contacts: 1,
      contrats: 0,
      lieux: 0,
      membres: 0,
      postes: 0,
      utilisateurs: 0,
    })
  })

  it('renvoie des zéros pour une structure inexistante', async () => {
    // WHEN
    const rattachements = await new PrismaRattachementsStructureLoader().compter(424_242)

    // THEN
    expect(rattachements).toStrictEqual({
      affectations: 0,
      contacts: 0,
      contrats: 0,
      lieux: 0,
      membres: 0,
      postes: 0,
      utilisateurs: 0,
    })
  })
})
