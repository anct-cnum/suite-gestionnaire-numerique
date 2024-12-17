import { PrismaStructuresLoader } from './PrismaStructureLoader'
import { departementRecordFactory, regionRecordFactory, structureRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'

describe('structures loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('étant donné des structures existantes, quand elles sont recherchées par leur nom', () => {
    describe('alors', () => {
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
          match: 'GRAND',
        },
        {
          desc: 'la casse est ignorée',
          expected: [
            {
              commune: 'NOISY-LE-GRAND',
              nom: 'GRAND PARIS GRAND EST',
              uid: '416',
            },
          ],
          match: 'grand',
        },
        {
          desc: 'la liste structures trouvées est triée par ordre alphabétique sur le nom',
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
          match: 'ris',
        },
        {
          desc: 'aucune structure n’est trouvée s’il n’y a aucune correspondance',
          expected: [],
          match: 'Solidarnum',
        },
      ])('$desc', async ({ match, expected }) => {
        // GIVEN
        await createStructures()
        const structureLoader = new PrismaStructuresLoader(prisma)

        // WHEN
        const structureReadModel = await structureLoader.findStructures(match)

        // THEN
        expect(structureReadModel).toStrictEqual(expected)
      })
    })

    it('et un département, alors seules les structures appartenant à ce département sont remontées', async () => {
      // GIVEN
      await createStructures()
      const structureLoader = new PrismaStructuresLoader(prisma)

      // WHEN
      const structureReadModel = await structureLoader.findStructuresByDepartement('ris', '06')

      // THEN
      expect(structureReadModel).toStrictEqual([
        {
          commune: 'GRASSE',
          nom: 'TETRIS',
          uid: '14',
        },
      ])
    })

    it('et une région, alors seules les structures appartenant à un département appartenant à cette région sont remontées', async () => {
      // GIVEN
      await createStructures()
      const structureLoader = new PrismaStructuresLoader(prisma)

      // WHEN
      const structureReadModel = await structureLoader.findStructuresByRegion('ris', '93')

      // THEN
      expect(structureReadModel).toStrictEqual([
        {
          commune: 'GRASSE',
          nom: 'TETRIS',
          uid: '14',
        },
      ])
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
