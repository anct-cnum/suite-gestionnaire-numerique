import { PrismaGouvernanceLoader } from './PrismaGouvernanceLoader'
import { departementRecordFactory, regionRecordFactory, utilisateurRecordFactory } from './testHelper'
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
    const user = await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({
        id: 123,
        nom: 'Deschamps',
        prenom: 'Jean',
      }),
    })
    const gouvernance = await prisma.gouvernanceRecord.create({
      data: {
        createurId: user.id,
        departementCode: '93',
        id: 1,
        idFNE: '123456',
      },
    })
    await prisma.noteDeContexteRecord.create({
      data: {
        contenu: '<STRONG class="test">Note privée (interne)</STRONG><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
        derniereEdition: new Date('2024-11-23'),
        editeurId: 123,
        gouvernanceId: gouvernance.id,
      },
    })
    await prisma.comiteRecord.create({
      data: {
        commentaire: 'commentaire',
        creation: new Date('2024-11-23'),
        dateProchainComite: new Date('2024-11-23'),
        derniereEdition: new Date('2024-11-23'),
        frequence: 'trimestrielle',
        gouvernanceId: gouvernance.id,
        nom: 'Comité stratégique 1',
        type: 'stratégique',
      },
    })
    await prisma.comiteRecord.create({
      data: {
        commentaire: 'commentaire',
        creation: new Date('2024-11-23'),
        dateProchainComite: new Date('2024-08-01'),
        derniereEdition: new Date('2024-11-23'),
        frequence: 'trimestrielle',
        gouvernanceId: gouvernance.id,
        nom: 'Comité stratégique 2',
        type: 'technique',
      },
    })

    const codeDepartement = '93'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.find(codeDepartement)

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      comites: [
        {
          commentaire: 'commentaire',
          dateProchainComite: new Date('2024-11-23'),
          nom: 'Comité stratégique 1',
          periodicite: 'trimestrielle',
          type: 'stratégique',
        },
        {
          commentaire: 'commentaire',
          dateProchainComite: new Date('2024-08-01'),
          nom: 'Comité stratégique 2',
          periodicite: 'trimestrielle',
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
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.find(codeDepartementInexistant)

    // THEN
    expect(gouvernanceReadModel).toBeNull()
  })

  it('quand une gouvernance est demandée par son code département existant et qu‘elle n’a pas de note de contexte ni comité, alors elle est renvoyée sans note de contexte ni comité', async () => {
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
    const user = await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({
        id: 123,
        nom: 'Deschamps',
        prenom: 'Jean',
      }),
    })
    await prisma.gouvernanceRecord.create({
      data: {
        createurId: user.id,
        departementCode: '93',
        id: 1,
        idFNE: '123456',
      },
    })

    const codeDepartement = '93'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.find(codeDepartement)

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      comites: undefined,
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
      noteDeContexte: undefined,
      uid: '123456',
    })
  })
})
