import { PrismaStructureLoader } from './PrismaStructureLoader'
import { departementRecordFactory, regionRecordFactory, structureRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'

describe('structures loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('étant donné des structures existantes, quand elles sont recherchées par leur nom, alors', () => {
    it.each([
      {
        desc: 'la correspondance se fait par inclusion du terme de la recherche',
        expected: [
          {
            nom: 'GRAND PARIS GRAND EST',
            uid: '416',
          },
        ],
        search: 'GRAND',
      },
      {
        desc: 'la casse étant ignorée',
        expected: [
          {
            nom: 'GRAND PARIS GRAND EST',
            uid: '416',
          },
        ],
        search: 'grand',
      },
      {
        desc: 'la liste structures trouvées étant triée par ordre alphabétique sur le nom',
        expected: [
          {
            nom: 'GRAND PARIS GRAND EST',
            uid: '416',
          },
          {
            nom: 'TETRIS',
            uid: '14',
          },
        ],
        search: 'ris',
      },
      {
        desc: 'ou vide s’il n’y a aucune correspondance',
        expected: [],
        search: 'Solidarnum',
      },
    ])('$desc', async ({ search, expected }) => {
      // GIVEN
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
          departementCode: '06',
          id: 14,
          nom: 'TETRIS',
        }),
      })
      await prisma.structureRecord.create({
        data: structureRecordFactory({
          departementCode: '93',
          id: 416,
          nom: 'GRAND PARIS GRAND EST',
        }),
      })
      const structureLoader = new PrismaStructureLoader(prisma)

      // WHEN
      const structureReadModel = await structureLoader.findStructures(search)

      // THEN
      expect(structureReadModel).toStrictEqual(expected)
    })
  })
})
