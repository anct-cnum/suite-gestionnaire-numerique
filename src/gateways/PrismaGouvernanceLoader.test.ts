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
          type: 'stratégique',
        },
        {
          dateProchainComite: new Date('2024-08-01'),
          nom: 'Comité stratégique 1',
          periodicite: 'Trimestriel',
          type: 'technique',
        },
      ],
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute: [
        {
          beneficiairesSubvention: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
          beneficiairesSubventionFormation: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
          budgetGlobal: 145_000,
          montantSubventionAccorde: 5_000,
          montantSubventionDemande: 40_000,
          montantSubventionFormationAccorde: 5_000,
          nom: 'Feuille de route inclusion 1',
          porteur: { nom: 'Préfecture du Rhône', roles: ['Co-orteur'], type: 'Administration' },
          totalActions: 3,
        },
        {
          beneficiairesSubvention: [],
          beneficiairesSubventionFormation: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
          budgetGlobal: 145_000,
          montantSubventionAccorde: 5_000,
          montantSubventionDemande: 40_000,
          montantSubventionFormationAccorde: 5_000,
          nom: 'Feuille de route inclusion 2',
          porteur: { nom: 'Préfecture du Rhône', roles: ['Co-orteur'], type: 'Administration' },
          totalActions: 2,
        },
      ],
      membres: [
        {
          contactPolitique: 'Laetitia Henrich, chargé de mission julien.deschamps@rhones.gouv.fr',
          contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [
            { nom: 'Feuille de route inclusion 1' },
            { nom: 'Feuille de route inclusion 2' },
          ],
          nom: 'Préfecture du Rhône',
          roles: ['Co-porteur'],
          telephone: '+33 4 45 00 45 00',
          type: 'Administration',
          typologieMembre: 'Préfecture départementale',
        },
        {
          contactPolitique: 'Jean Dupont, chargé de mission jean.dupont@rhones.gouv.fr',
          contactTechnique: 'Simone.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [{ nom: 'Feuille de route inclusion 1' }],
          nom: 'Département du Rhône',
          roles: ['Co-porteur', 'Financeur'],
          telephone: '+33 4 45 00 45 01',
          type: 'Collectivité',
          typologieMembre: 'Collectivité, EPCI',
        },
        {
          contactPolitique: 'Coco Dupont, chargé de mission coco.dupont@rhones.gouv.fr',
          contactTechnique: 'coco.dupont@rhones.gouv.fr',
          feuillesDeRoute: [],
          nom: 'CC des Monts du Lyonnais',
          roles: ['Co-porteur', 'Financeur'],
          telephone: '',
          type: 'Collectivité',
          typologieMembre: 'Collectivité, EPCI',
        },
      ],
      noteDeContexte: {
        dateDeModification: new Date('2024-11-23'),
        nomAuteur: 'Deschamps',
        prenomAuteur: 'Jean',
        texte: '<STRONG class="test">Note privée (interne)</STRONG><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
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
