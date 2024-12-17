import { PrismaStructureLoader } from './PrismaStructureLoader'
import { departementRecordFactory, regionRecordFactory, structureRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { RechercherStruturesQuery } from '@/use-cases/queries/RechercherLesStructures'

describe('structures loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('étant donné des structures existantes, quand elles sont recherchées par leur nom, alors', () => {
    it.each([
      {
        desc: 'la correspondance se fait par inclusion du terme de la recherche',
        expected: [
          {
            commune: 'NOISY-LE-GRAND',
            nom: 'GRAND PARIS GRAND EST',
            uid: '416',
          },
        ],
        query: { match: 'GRAND' },
      },
      {
        desc: 'la casse étant ignorée',
        expected: [
          {
            commune: 'NOISY-LE-GRAND',
            nom: 'GRAND PARIS GRAND EST',
            uid: '416',
          },
        ],
        query: { match: 'grand' },
      },
      {
        desc: 'la liste structures trouvées étant triée par ordre alphabétique sur le nom',
        expected: [
          {
            commune: 'NOISY-LE-GRAND',
            nom: 'GRAND PARIS GRAND EST',
            uid: '416',
          },
          {
            commune: 'GRASSE',
            nom: 'TETRIS',
            uid: '14',
          },
        ],
        query: { match: 'ris' },
      },
      {
        desc: 'ou vide s’il n’y a aucune correspondance',
        expected: [],
        query: { match: 'Solidarnum' },
      },
    ])('$desc', async ({ query, expected }) => {
      // GIVEN
      await createStructures()
      const structureLoader = new PrismaStructureLoader(prisma)

      // WHEN
      const structureReadModel = await structureLoader.findStructures(query)

      // THEN
      expect(structureReadModel).toStrictEqual(expected)
    })
  })

  describe('étant donné des structures existantes, quand elles sont recherchées par leur nom', () => {
    it.each([
      {
        desc: 'et un département, alors seules les structures appartenant à ce département sont remontées',
        expected: [
          {
            commune: 'GRASSE',
            nom: 'TETRIS',
            uid: '14',
          },
        ],
        query: { match: 'ris', zone: ['departement', '06'] },
      },
      {
        desc: 'et une région, alors seules les structures appartenant à un département appartenant à cette région sont remontées',
        expected: [
          {
            commune: 'GRASSE',
            nom: 'TETRIS',
            uid: '14',
          },
        ],
        query: { match: 'ris', zone: ['region', '93'] },
      },
    ])('$desc', async ({ query, expected }) => {
      // GIVEN
      await createStructures()
      const structureLoader = new PrismaStructureLoader(prisma)

      // WHEN
      const structureReadModel = await structureLoader.findStructures(query as RechercherStruturesQuery)

      // THEN
      expect(structureReadModel).toStrictEqual(expected)
    })
  })
})

async function createStructures(): Promise<void> {
  await prisma.regionRecord.create({
    data: regionRecordFactory({ code: '93', nom: 'Provence-Alpes-Côte d’Azur' }),
  })
  await prisma.regionRecord.create({ data: regionRecordFactory() })
  await prisma.departementRecord.create({
    data: departementRecordFactory({ code: '06', nom: 'Alpes-Maritimes', regionCode: '93' }),
  })
  await prisma.departementRecord.create({
    data: departementRecordFactory({ code: '93', nom: 'Seine-Saint-Denis' }),
  })
  await prisma.structureRecord.create({
    data: structureRecordFactory({
      commune: 'GRASSE',
      departementCode: '06',
      id: 14,
      nom: 'TETRIS',
    }),
  })
  await prisma.structureRecord.create({
    data: structureRecordFactory({
      commune: 'NOISY-LE-GRAND',
      departementCode: '93',
      id: 416,
      nom: 'GRAND PARIS GRAND EST',
    }),
  })
}
