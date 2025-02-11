import { PrismaLesFeuillesDeRouteLoader } from './PrismaLesFeuillesDeRouteLoader'
import { creerUnDepartement, creerUneFeuilleDeRoute, creerUneGouvernance, creerUneRegion } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTime, epochTimeMinusTwoDays } from '@/shared/testHelper'
import { FeuillesDeRouteReadModel } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

describe('récupérer les feuilles de route loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand une liste de feuilles de route est demandée par son code département existant, alors elle est renvoyée rangée par ordre de création décroissante', async () => {
    // GIVEN
    await creerUneRegion()
    await creerUnDepartement({ code: '93' })
    await creerUnDepartement({ code: '75' })
    await creerUneGouvernance({ departementCode: '93' })
    await creerUneGouvernance({ departementCode: '75' })
    await creerUneFeuilleDeRoute({ creation: epochTimeMinusTwoDays, gouvernanceDepartementCode: '93', id: 1, nom: 'fdr1' })
    await creerUneFeuilleDeRoute({ creation: epochTime, gouvernanceDepartementCode: '93', id: 2, nom: 'fdr2' })
    await creerUneFeuilleDeRoute({ creation: epochTime, gouvernanceDepartementCode: '75', id: 3, nom: 'fdr3' })
    const feuillesDeRouteLoader = new PrismaLesFeuillesDeRouteLoader(prisma.feuilleDeRouteRecord)

    // WHEN
    const feuillesDeRouteReadModel = await feuillesDeRouteLoader.feuillesDeRoute('93')

    // THEN
    expect(feuillesDeRouteReadModel).toStrictEqual<FeuillesDeRouteReadModel>({
      departement: '93',
      feuillesDeRoute: [
        {
          actions: [
            {
              nom: 'Structurer une filière de reconditionnement locale 1',
              statut: 'deposee',
              totaux: {
                coFinancement: 30_000,
                financementAccorde: 40_000,
              },
              uid: 'actionFooId1',
            },
            {
              nom: 'Structurer une filière de reconditionnement locale 2',
              statut: 'en_cours',
              totaux: {
                coFinancement: 50_000,
                financementAccorde: 20_000,
              },
              uid: 'actionFooId2',
            },
          ],
          beneficiaires: 5,
          coFinanceurs: 3,
          nom: 'fdr2',
          structureCoPorteuse: {
            nom: 'CC des Monts du Lyonnais',
            uid: 'structureCoPorteuseFooId',
          },
          totaux: {
            budget: 0,
            coFinancement: 0,
            financementAccorde: 0,
          },
          uid: '2',
        },
        {
          actions: [
            {
              nom: 'Structurer une filière de reconditionnement locale 1',
              statut: 'deposee',
              totaux: {
                coFinancement: 30_000,
                financementAccorde: 40_000,
              },
              uid: 'actionFooId1',
            },
            {
              nom: 'Structurer une filière de reconditionnement locale 2',
              statut: 'en_cours',
              totaux: {
                coFinancement: 50_000,
                financementAccorde: 20_000,
              },
              uid: 'actionFooId2',
            },
          ],
          beneficiaires: 5,
          coFinanceurs: 3,
          nom: 'fdr1',
          structureCoPorteuse: {
            nom: 'CC des Monts du Lyonnais',
            uid: 'structureCoPorteuseFooId',
          },
          totaux: {
            budget: 0,
            coFinancement: 0,
            financementAccorde: 0,
          },
          uid: '1',
        },
      ],
      totaux: {
        budget: 0,
        coFinancement: 0,
        financementAccorde: 0,
      },
    })
  })
})
