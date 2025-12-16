import { PrismaStructureLoader } from './PrismaStructureLoader'
import { creerUnContact, creerUnDepartement, creerUneGouvernance, creerUneRegion, creerUneStructure, creerUnMembre } from './testHelper'
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
            isMembre: false,
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
            isMembre: false,
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
            isMembre: false,
            nom: 'GRAND PARIS GRAND EST',
            uid: '416',
          },
          {
            commune: 'GRASSE',
            isMembre: false,
            nom: 'TETRIS',
            uid: '14',
          },
        ],
        intention: 'la liste structures trouvées est triée par ordre alphabétique sur le nom',
        match: 'ris',
      },
      {
        expected: [],
        intention: 'aucune structure n\'est trouvée s\'il n\'y a aucune correspondance',
        match: 'Solidarnum',
      },
    ])('alors $intention', async ({ expected, match }) => {
      // GIVEN
      await createStructures()

      // WHEN
      const structureReadModel = await new PrismaStructureLoader().structures(match)

      // THEN
      expect(structureReadModel).toStrictEqual(expected)
    })

    it('et un département, alors seules les structures appartenant à ce département sont remontées', async () => {
      // GIVEN
      await createStructures()

      // WHEN
      const structureReadModel = await new PrismaStructureLoader().structuresByDepartement('ris', '06')

      // THEN
      expect(structureReadModel).toStrictEqual([
        {
          commune: 'GRASSE',
          isMembre: false,
          nom: 'TETRIS',
          uid: '14',
        },
      ])
    })

    it('et une région, alors seules les structures appartenant à un département appartenant à cette région sont remontées', async () => {
      // GIVEN
      await createStructures()

      // WHEN
      const structureReadModel = await new PrismaStructureLoader().structuresByRegion('ris', '93')

      // THEN
      expect(structureReadModel).toStrictEqual([
        {
          commune: 'GRASSE',
          isMembre: false,
          nom: 'TETRIS',
          uid: '14',
        },
      ])
    })
  })

  describe('recherche flexible avec trigrams et unaccent', () => {
    it('trouve une structure avec des mots non contigus', async () => {
      // GIVEN
      await creerUneRegion()
      await creerUnDepartement({ code: '10', nom: 'Aube' })
      await creerUneStructure({ commune: 'TROYES', departementCode: '10', id: 100, nom: 'Conseil départemental de l\'Aube' })

      // WHEN
      const structureReadModel = await new PrismaStructureLoader().structures('conseil aube')

      // THEN
      expect(structureReadModel).toStrictEqual([
        {
          commune: 'TROYES',
          isMembre: false,
          nom: 'Conseil départemental de l\'Aube',
          uid: '100',
        },
      ])
    })

    it('trouve une structure malgré une faute de frappe grâce aux trigrams', async () => {
      // GIVEN
      await creerUneRegion()
      await creerUnDepartement({ code: '10', nom: 'Aube' })
      await creerUneStructure({ commune: 'TROYES', departementCode: '10', id: 100, nom: 'Conseil départemental de l\'Aube' })

      // WHEN - "aude" au lieu de "aube"
      const structureReadModel = await new PrismaStructureLoader().structures('conseil aude')

      // THEN
      expect(structureReadModel).toStrictEqual([
        {
          commune: 'TROYES',
          isMembre: false,
          nom: 'Conseil départemental de l\'Aube',
          uid: '100',
        },
      ])
    })

    it('trouve une structure sans accent dans la recherche', async () => {
      // GIVEN
      await creerUneRegion()
      await creerUnDepartement({ code: '10', nom: 'Aube' })
      await creerUneStructure({ commune: 'TROYES', departementCode: '10', id: 100, nom: 'Conseil départemental de l\'Aube' })

      // WHEN - "departemental" sans accent
      const structureReadModel = await new PrismaStructureLoader().structures('departemental')

      // THEN
      expect(structureReadModel).toStrictEqual([
        {
          commune: 'TROYES',
          isMembre: false,
          nom: 'Conseil départemental de l\'Aube',
          uid: '100',
        },
      ])
    })

    it('retourne un tableau vide si la recherche est vide', async () => {
      // GIVEN
      await creerUneRegion()
      await creerUnDepartement({ code: '10', nom: 'Aube' })
      await creerUneStructure({ commune: 'TROYES', departementCode: '10', id: 100, nom: 'Conseil départemental de l\'Aube' })

      // WHEN
      const structureReadModel = await new PrismaStructureLoader().structures('   ')

      // THEN
      expect(structureReadModel).toStrictEqual([])
    })

    it('indique si une structure est membre d\'une gouvernance', async () => {
      // GIVEN
      await creerUneRegion()
      await creerUnDepartement({ code: '10', nom: 'Aube' })
      await creerUneStructure({ commune: 'TROYES', departementCode: '10', id: 100, nom: 'Conseil départemental de l\'Aube' })
      await creerUneGouvernance({ departementCode: '10' })
      await creerUnContact({ email: 'contact@aube.fr' })
      await creerUnMembre({
        contact: 'contact@aube.fr',
        gouvernanceDepartementCode: '10',
        id: 'membre-100',
        structureId: 100,
      })

      // WHEN
      const structureReadModel = await new PrismaStructureLoader().structures('conseil aube')

      // THEN
      expect(structureReadModel).toStrictEqual([
        {
          commune: 'TROYES',
          isMembre: true,
          nom: 'Conseil départemental de l\'Aube',
          uid: '100',
        },
      ])
    })
  })
})

async function createStructures(): Promise<void> {
  await creerUneRegion()
  await creerUneRegion({ code: '93', nom: 'Provence-Alpes-Côte d\'Azur' })
  await creerUnDepartement({ code: '06', nom: 'Alpes-Maritimes', regionCode: '93' })
  await creerUnDepartement({ code: '93', nom: 'Seine-Saint-Denis' })
  await creerUneStructure({ commune: 'GRASSE', departementCode: '06', id: 14, nom: 'TETRIS' })
  await creerUneStructure({ commune: 'NOISY-LE-GRAND', departementCode: '93', id: 416, nom: 'GRAND PARIS GRAND EST' })
}
