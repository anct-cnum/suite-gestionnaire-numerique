import { PrismaStructureLoader } from './PrismaStructureLoader'
import { creerUnDepartement, creerUneRegion, creerUneStructure } from './testHelper'
import prisma from '../../prisma/prismaClient'

describe('structures loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('étant donné des structures existantes, quand elles sont recherchées par leur nom', () => {
    it.each([
      {
        expected: [
          {
            commune: 'NOISY-LE-GRAND',
            nom: 'GRAND PARIS GRAND EST',
            uid: '416',
          },
        ],
        intention: 'la correspondance se fait par inclusion du terme de la recherche',
        match: 'GRAND',
      },
      {
        expected: [
          {
            commune: 'NOISY-LE-GRAND',
            nom: 'GRAND PARIS GRAND EST',
            uid: '416',
          },
        ],
        intention: 'la casse est ignorée',
        match: 'grand',
      },
      {
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
        intention: 'la liste structures trouvées est triée par ordre alphabétique sur le nom',
        match: 'ris',
      },
      {
        expected: [],
        intention: 'aucune structure n’est trouvée s’il n’y a aucune correspondance',
        match: 'Solidarnum',
      },
    ])('alors $intention', async ({ match, expected }) => {
      // GIVEN
      await createStructures()
      const structureLoader = new PrismaStructureLoader(prisma.structureRecord)

      // WHEN
      const structureReadModel = await structureLoader.findStructures(match)

      // THEN
      expect(structureReadModel).toStrictEqual(expected)
    })

    it('et un département, alors seules les structures appartenant à ce département sont remontées', async () => {
      // GIVEN
      await createStructures()
      const structureLoader = new PrismaStructureLoader(prisma.structureRecord)

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
      const structureLoader = new PrismaStructureLoader(prisma.structureRecord)

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
  await creerUneRegion()
  await creerUneRegion({ code: '93', nom: 'Provence-Alpes-Côte d’Azur' })
  await creerUnDepartement({ code: '06', nom: 'Alpes-Maritimes', regionCode: '93' })
  await creerUnDepartement({ code: '93', nom: 'Seine-Saint-Denis' })
  await creerUneStructure({ commune: 'GRASSE', departementCode: '06', id: 14, nom: 'TETRIS' })
  await creerUneStructure({ commune: 'NOISY-LE-GRAND', departementCode: '93', id: 416, nom: 'GRAND PARIS GRAND EST' })
}
