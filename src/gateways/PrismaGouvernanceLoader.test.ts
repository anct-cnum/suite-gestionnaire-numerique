import { PrismaGouvernanceLoader } from './PrismaGouvernanceLoader'
import { departementRecordFactory, regionRecordFactory, utilisateurRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTime } from '@/shared/testHelper'
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
    await prisma.departementRecord.create({
      data: departementRecordFactory({
        code: '75',
        nom: 'Paris',
      }),
    })
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({
        id: 123,
        nom: 'Deschamps',
        prenom: 'Jean',
        ssoId: 'userFooId',
      }),
    })
    await prisma.gouvernanceRecord.create({
      data: {
        departementCode: '75',
      },
    })
    await prisma.gouvernanceRecord.create({
      data: {
        departementCode: '93',
        editeurNotePriveeId: 'userFooId',
        notePrivee: {
          contenu: 'un contenu quelconque',
          derniereEdition: epochTime.toISOString(),
        },
      },
    })
    await prisma.noteDeContexteRecord.create({
      data: {
        contenu: '<STRONG class="test">Note privée (interne)</STRONG><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
        derniereEdition: new Date('2024-11-23'),
        editeurId: 'userFooId',
        gouvernanceDepartementCode: '93',
      },
    })
    await prisma.comiteRecord.create({
      data: {
        commentaire: 'commentaire',
        creation: new Date('2024-11-23'),
        date: new Date('2024-11-23'),
        derniereEdition: new Date('2024-11-23'),
        editeurUtilisateurId: 'userFooId',
        frequence: 'trimestrielle',
        gouvernanceDepartementCode: '93',
        type: 'stratégique',
      },
    })
    await prisma.comiteRecord.create({
      data: {
        commentaire: 'commentaire',
        creation: new Date('2024-11-23'),
        date: new Date('2024-08-01'),
        derniereEdition: new Date('2024-11-23'),
        editeurUtilisateurId: 'userFooId',
        frequence: 'trimestrielle',
        gouvernanceDepartementCode: '93',
        type: 'technique',
      },
    })
    await prisma.feuilleDeRouteRecord.create({
      data: {
        creation: epochTime,
        gouvernanceDepartementCode: '93',
        nom: 'Feuille de route inclusion',
      },
    })
    await prisma.feuilleDeRouteRecord.create({
      data: {
        creation: epochTime,
        gouvernanceDepartementCode: '93',
        nom: 'Feuille de route numérique du Rhône',
      },
    })

    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.trouverEtEnrichir('93')

    // THEN
    expect(gouvernanceReadModel).toMatchObject<UneGouvernanceReadModel>({
      comites: [
        // @ts-expect-error
        {
          commentaire: 'commentaire',
          date: new Date('2024-11-23'),
          derniereEdition: new Date('2024-11-23'),
          frequence: 'trimestrielle',
          nomEditeur: 'Deschamps',
          prenomEditeur: 'Jean',
          type: 'stratégique',
        },
        // @ts-expect-error
        {
          commentaire: 'commentaire',
          date: new Date('2024-08-01'),
          derniereEdition: new Date('2024-11-23'),
          frequence: 'trimestrielle',
          nomEditeur: 'Deschamps',
          prenomEditeur: 'Jean',
          type: 'technique',
        },
      ],
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute,
      membres,
      noteDeContexte: {
        dateDeModification: new Date('2024-11-23'),
        nomAuteur: 'Deschamps',
        prenomAuteur: 'Jean',
        texte: '<STRONG class="test">Note privée (interne)</STRONG><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
      },
      notePrivee: {
        dateDEdition: epochTime,
        nomEditeur: 'Deschamps',
        prenomEditeur: 'Jean',
        texte: 'un contenu quelconque',
      },
      uid: '93',
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
    const gouvernanceReadModel = gouvernanceLoader.trouverEtEnrichir(codeDepartementInexistant)

    // THEN
    await expect(async () => gouvernanceReadModel).rejects.toThrow('Le département n’existe pas')
  })

  it('quand une gouvernance est demandée par son code département existant et qu’elle n’a pas de note de contexte ni comité ni note privée, alors elle est renvoyée sans note de contexte ni comité ni note privée', async () => {
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

    await prisma.gouvernanceRecord.create({
      data: {
        departementCode: '93',
      },
    })

    await prisma.feuilleDeRouteRecord.create({
      data: {
        creation: epochTime,
        gouvernanceDepartementCode: '93',
        nom: 'Feuille de route inclusion',
      },
    })
    await prisma.feuilleDeRouteRecord.create({
      data: {
        creation: epochTime,
        gouvernanceDepartementCode: '93',
        nom: 'Feuille de route numérique du Rhône',
      },
    })

    const codeDepartement = '93'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.trouverEtEnrichir(codeDepartement)

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      comites: undefined,
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute,
      membres,
      noteDeContexte: undefined,
      notePrivee: undefined,
      uid: '93',
    })
  })

  it('quand une gouvernance est demandée par son code département existant avec un comité sans date de prochain comité, alors elle est renvoyée sans date de prochain comité', async () => {
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
    const gouvernance = await prisma.gouvernanceRecord.create({
      data: {
        departementCode: '93',
      },
    })
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({ nom: 'Deschamps', prenom: 'Jean', ssoId: 'userFooId' }),
    })
    await prisma.comiteRecord.create({
      data: {
        commentaire: 'commentaire',
        creation: new Date('2024-11-23'),
        derniereEdition: new Date('2024-11-23'),
        editeurUtilisateurId: 'userFooId',
        frequence: 'trimestrielle',
        gouvernanceDepartementCode: gouvernance.departementCode,
        type: 'stratégique',
      },
    })

    const codeDepartement = '93'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.trouverEtEnrichir(codeDepartement)

    // THEN
    expect(gouvernanceReadModel.comites).toMatchObject<Omit<UneGouvernanceReadModel['comites'], 'id'>>(
      [
        {
          commentaire: 'commentaire',
          date: undefined,
          derniereEdition: new Date('2024-11-23'),
          frequence: 'trimestrielle',
          nomEditeur: 'Deschamps',
          periodicite: 'trimestrielle',
          prenomEditeur: 'Jean',
          type: 'stratégique',
        },
      ]
    )
  })

  it('quand une gouvernance est demandée par son code département existant avec un comité sans commentaire, alors elle est renvoyée sans commentaire', async () => {
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
    const gouvernance = await prisma.gouvernanceRecord.create({
      data: {
        departementCode: '93',
      },
    })
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({ nom: 'Deschamps', prenom: 'Jean', ssoId: 'userFooId' }),
    })
    await prisma.comiteRecord.create({
      data: {
        creation: new Date('2024-11-23'),
        date: new Date('2024-11-23'),
        derniereEdition: new Date('2024-11-23'),
        editeurUtilisateurId: 'userFooId',
        frequence: 'trimestrielle',
        gouvernanceDepartementCode: gouvernance.departementCode,
        type: 'stratégique',
      },
    })

    const codeDepartement = '93'

    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.trouverEtEnrichir(codeDepartement)

    // THEN
    expect(gouvernanceReadModel.comites).toMatchObject<Omit<UneGouvernanceReadModel['comites'], 'id'>>(
      [
        {
          commentaire: '',
          date: new Date('2024-11-23'),
          derniereEdition: new Date('2024-11-23'),
          frequence: 'trimestrielle',
          nomEditeur: 'Deschamps',
          prenomEditeur: 'Jean',
          type: 'stratégique',
        },
      ]
    )
  })

  it('quand une gouvernance est demandée par son code département existant avec un comité sans éditeur, alors elle est renvoyée sans éditeur', async () => {
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
    const gouvernance = await prisma.gouvernanceRecord.create({
      data: {
        departementCode: '93',
      },
    })
    await prisma.utilisateurRecord.create({ data: utilisateurRecordFactory() })
    await prisma.comiteRecord.create({
      data: {
        commentaire: 'commentaire',
        creation: new Date('2024-11-23'),
        date: new Date('2024-11-23'),
        derniereEdition: new Date('2024-11-23'),
        editeurUtilisateurId: 'userFooId',
        frequence: 'trimestrielle',
        gouvernanceDepartementCode: gouvernance.departementCode,
        type: 'stratégique',
      },
    })

    const codeDepartement = '93'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.trouverEtEnrichir(codeDepartement)

    // THEN
    expect(gouvernanceReadModel.comites).toMatchObject<Omit<UneGouvernanceReadModel['comites'], 'id'>>(
      [
        {
          commentaire: 'commentaire',
          date: new Date('2024-11-23'),
          derniereEdition: new Date('2024-11-23'),
          frequence: 'trimestrielle',
          nomEditeur: 'Tartempion',
          periodicite: 'trimestrielle',
          prenomEditeur: 'Martin',
          type: 'stratégique',
        },
      ]
    )
  })
})

const feuillesDeRoute: UneGouvernanceReadModel['feuillesDeRoute'] = [
  {
    beneficiairesSubvention: [
      { nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' },
      { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' },
    ],
    beneficiairesSubventionFormation: [
      { nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' },
      { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' },
    ],
    budgetGlobal: 145_000,
    montantSubventionAccorde: 5_000,
    montantSubventionDemande: 40_000,
    montantSubventionFormationAccorde: 5_000,
    nom: 'Feuille de route inclusion',
    porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
    totalActions: 3,
  },
  {
    beneficiairesSubvention: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
    beneficiairesSubventionFormation: [
      { nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' },
      { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' },
    ],
    budgetGlobal: 145_000,
    montantSubventionAccorde: 5_000,
    montantSubventionDemande: 40_000,
    montantSubventionFormationAccorde: 5_000,
    nom: 'Feuille de route numérique du Rhône',
    porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
    totalActions: 3,
  },
]

const membres: UneGouvernanceReadModel['membres'] = [
  {
    contactReferent: {
      denomination: 'Contact politique de la collectivité',
      mailContact: 'julien.deschamps@rhones.gouv.fr',
      nom: 'Henrich',
      poste: 'chargé de mission',
      prenom: 'Laetitia',
    },
    contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
    feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }, { montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route numérique du Rhône' }],
    links: {},
    nom: 'Préfecture du Rhône',
    roles: ['Co-porteur'],
    telephone: '+33 4 45 00 45 00',
    totalMontantSubventionAccorde: NaN,
    totalMontantSubventionFormationAccorde: NaN,
    type: 'Administration',
    typologieMembre: 'Préfecture départementale',
  },
  {
    contactReferent: {
      denomination: 'Contact référent',
      mailContact: 'didier.durand@exemple.com',
      nom: 'Didier',
      poste: 'chargé de mission',
      prenom: 'Durant',
    },
    feuillesDeRoute: [{ montantSubventionAccorde: 30_000, montantSubventionFormationAccorde: 20_000, nom: 'Feuille de route inclusion' }],
    links: {},
    nom: 'Département du Rhône',
    roles: ['Co-porteur', 'Financeur'],
    telephone: '+33 4 45 00 45 01',
    totalMontantSubventionAccorde: NaN,
    totalMontantSubventionFormationAccorde: NaN,
    type: 'Collectivité',
    typologieMembre: 'Collectivité, EPCI',
  },
  {
    contactReferent: {
      denomination: 'Contact référent',
      mailContact: 'coco.dupont@rhones.gouv.fr',
      nom: 'Coco',
      poste: 'chargé de mission',
      prenom: 'Dupont',
    },
    feuillesDeRoute: [],
    links: {},
    nom: 'CC des Monts du Lyonnais',
    roles: ['Co-porteur', 'Financeur'],
    telephone: '',
    totalMontantSubventionAccorde: NaN,
    totalMontantSubventionFormationAccorde: NaN,
    type: 'Collectivité',
    typologieMembre: 'Collectivité, EPCI',
  },
]
