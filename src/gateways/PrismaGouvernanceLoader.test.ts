import { PrismaGouvernanceLoader } from './PrismaGouvernanceLoader'
import { departementRecordFactory, regionRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

describe('gouvernance loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand une gouvernance est demandée par son code département existant, alors elle est renvoyée', async () => {
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
    const codeDepartement = '93'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.find(codeDepartement)

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      comites: [
        {
          dateProchainComite: new Date('2024-09-06'),
          nom: 'Comité stratégique 2',
          periodicite: 'Semestriel',
        },
        {
          dateProchainComite: new Date('2024-08-01'),
          nom: 'Comité stratégique 1',
          periodicite: 'Trimestriel',
        },
      ],
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute: [
        {
          budgetGlobal: 145000,
          nom: 'Feuille de route inclusion 1',
          totalActions: 3,
        },
        {
          budgetGlobal: 88030,
          nom: 'Feuille de route inclusion 2',
          totalActions: 1,
        },
      ],
      membres: [
        {
          nom: 'Préfecture du Rhône',
          roles: ['Co-porteur'],
          type: 'Administration',
        },
        {
          nom: 'Département du Rhône',
          roles: ['Co-porteur', 'Financeur'],
          type: 'Collectivité',
        },
        {
          nom: 'CC des Monts du Lyonnais',
          roles: ['Co-porteur', 'Financeur'],
          type: 'Collectivité',
        },
      ],
      noteDeContexte: {
        dateDeModification: new Date('2024-11-23'),
        nomAuteur: 'Deschamps',
        prenomAuteur: 'Jean',
        texte: '<strong>Note privée (interne)</strong><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
      },
      uid: '123456',
    })
  })

  it('quand une gouvernance est demandée par son code département inexistant, alors elle n’est pas renvoyée', async () => {
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
    const codeDepartementInexistant = 'zzz'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.find(codeDepartementInexistant)

    // THEN
    expect(gouvernanceReadModel).toBeNull()
  })
})
