import { PrismaStructureLoader } from './PrismaStructureLoader'
import { departementRecordFactory, regionRecordFactory, structureRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { StructuresReadModel } from '../use-cases/queries/RechercherLesStructures'

describe('gouvernance loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand je récupère la liste des structures par une recherche qui correspond à certaines structures, alors ces structures sont renvoyées', async () => {
    // GIVEN
    await prisma.regionRecord.create({
      data: regionRecordFactory({
        code: '11',
      }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({
        code: '93',
        nom: 'Seine-Saint-Denis',
      }),
    })
    await prisma.structureRecord.create({
      data: structureRecordFactory({
        departementCode: '93',
        nom: 'Grand Paris Grand Est',
      }),
    })
    const search = 'Grand'
    const structureLoader = new PrismaStructureLoader(prisma)

    // WHEN
    const structureReadModel = await structureLoader.findStructures(search)

    // THEN
    expect(structureReadModel).toStrictEqual<StructuresReadModel>([
      {
        nom: 'Grand Paris Grand Est',
        uid: '10',
      },
    ])
  })

  it('quand je récupère la liste des structures par une recherche qui ne correspond à aucune structure, alors une liste vide est renvoyée', async () => {
    // GIVEN
    await prisma.regionRecord.create({
      data: regionRecordFactory({
        code: '11',
      }),
    })
    await prisma.departementRecord.create({
      data: departementRecordFactory({
        code: '93',
        nom: 'Seine-Saint-Denis',
      }),
    })
    await prisma.structureRecord.create({
      data: structureRecordFactory({
        departementCode: '93',
        nom: 'Grand Paris Grand Est',
      }),
    })
    const search = 'toto'
    const structureLoader = new PrismaStructureLoader(prisma)

    // WHEN
    const structureReadModel = await structureLoader.findStructures(search)

    // THEN
    expect(structureReadModel).toStrictEqual<StructuresReadModel>([])
  })
})
