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
    await creerDepartements()
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory({
        id: 123,
        nom: 'Deschamps',
        prenom: 'Jean',
        ssoId: 'userFooId',
      }),
    })
    await creerGouvernances()
    await creerNoteDeContexte()
    await creerComites()
    await creerFeuillesDeRoute()
    await creerMembres()

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
        dateDeModification: epochTime,
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
    await creerDepartements()
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
    await creerDepartements()

    await prisma.gouvernanceRecord.create({
      data: {
        departementCode: '93',
      },
    })
    await creerFeuillesDeRoute()
    await creerMembres()

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
    nom: 'Feuille de route numérique du Rhône',
    porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
    totalActions: 3,
  },
]

const membres: UneGouvernanceReadModel['membres'] = [
  {
    nom: 'CA Tulle Agglo',
    roles: ['observateur'],
    type: 'Collectivité',
    typologieMembre: 'epci',
  },
  {
    nom: 'CC Porte du Jura',
    roles: ['beneficiaire', 'coporteur'],
    type: 'Collectivité',
    typologieMembre: 'epci',
  },
  {
    nom: 'Créteil',
    roles: ['coporteur'],
    type: 'Collectivité',
    typologieMembre: 'commune',
  },
  {
    nom: 'Orange',
    roles: ['coporteur', 'recipiendaire'],
    type: 'Entreprise privée',
    typologieMembre: 'structure',
  },
  {
    nom: 'Paris',
    roles: ['N/A'],
    type: 'Conseil départemental',
    typologieMembre: 'departement',
  },
  {
    nom: 'Seine-Saint-Denis',
    roles: ['coporteur'],
    type: 'Préfecture départementale',
    typologieMembre: 'departement',
  },
  {
    nom: 'Trévérien',
    roles: ['beneficiaire', 'recipiendaire'],
    type: 'Collectivité',
    typologieMembre: 'commune',
  },
  {
    nom: 'Île-de-France',
    roles: ['N/A'],
    type: 'Préfecture régionale',
    typologieMembre: 'sgar',
  },
].map((partialMembre) => ({
  contactReferent: {
    denomination: 'Contact politique de la collectivité',
    mailContact: 'julien.deschamps@example.com',
    nom: 'Henrich',
    poste: 'chargé de mission',
    prenom: 'Laetitia',
  },
  contactTechnique: 'Simon.lagrange@example.com',
  feuillesDeRoute: [
    {
      montantSubventionAccorde: 5_000,
      montantSubventionFormationAccorde: 5_000,
      nom: 'Feuille de route inclusion',
    },
    {
      montantSubventionAccorde: 5_000,
      montantSubventionFormationAccorde: 5_000,
      nom: 'Feuille de route numérique du Rhône',
    },
  ],
  links: {},
  telephone: '+33 4 45 00 45 00',
  totalMontantSubventionAccorde: NaN,
  totalMontantSubventionFormationAccorde: NaN,
  ...partialMembre,
}))

async function creerDepartements(): Promise<void> {
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
}

async function creerGouvernances(): Promise<void> {
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
}

async function creerNoteDeContexte(): Promise<void> {
  await prisma.noteDeContexteRecord.create({
    data: {
      contenu: '<STRONG class="test">Note privée (interne)</STRONG><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
      derniereEdition: epochTime,
      editeurId: 'userFooId',
      gouvernanceDepartementCode: '93',
    },
  })
}

async function creerComites(): Promise<void> {
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
}

async function creerFeuillesDeRoute(): Promise<void> {
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
}

async function creerMembres(): Promise<void> {
  await prisma.membreGouvernanceCommuneRecord.create({
    data: {
      commune: 'Trévérien',
      gouvernanceDepartementCode: '93',
      role: 'recipiendaire',
      type: 'Collectivité',
    },
  })
  await prisma.membreGouvernanceCommuneRecord.create({
    data: {
      commune: 'Trévérien',
      gouvernanceDepartementCode: '93',
      role: 'beneficiaire',
      type: 'Collectivité',
    },
  })
  await prisma.membreGouvernanceCommuneRecord.create({
    data: {
      commune: 'Créteil',
      gouvernanceDepartementCode: '93',
      role: 'coporteur',
      type: 'Collectivité',
    },
  })
  await prisma.membreGouvernanceDepartementRecord.create({
    data: {
      departementCode: '93',
      gouvernanceDepartementCode: '93',
      role: 'coporteur',
      type: 'Préfecture départementale',
    },
  })
  await prisma.membreGouvernanceDepartementRecord.create({
    data: {
      departementCode: '75',
      gouvernanceDepartementCode: '93',
      role: 'N/A',
      type: 'Conseil départemental',
    },
  })
  await prisma.membreGouvernanceEpciRecord.create({
    data: {
      epci: 'CA Tulle Agglo',
      gouvernanceDepartementCode: '93',
      role: 'observateur',
      type: 'Collectivité',
    },
  })
  await prisma.membreGouvernanceEpciRecord.create({
    data: {
      epci: 'CC Porte du Jura',
      gouvernanceDepartementCode: '93',
      role: 'coporteur',
      type: 'Collectivité',
    },
  })
  await prisma.membreGouvernanceEpciRecord.create({
    data: {
      epci: 'CC Porte du Jura',
      gouvernanceDepartementCode: '93',
      role: 'beneficiaire',
      type: 'Collectivité',
    },
  })
  await prisma.membreGouvernanceSgarRecord.create({
    data: {
      gouvernanceDepartementCode: '93',
      role: 'N/A',
      sgarCode: '11',
      type: 'Préfecture régionale',
    },
  })
  await prisma.membreGouvernanceStructureRecord.create({
    data: {
      gouvernanceDepartementCode: '93',
      role: 'recipiendaire',
      structure: 'Orange',
      type: 'Entreprise privée',
    },
  })
  await prisma.membreGouvernanceStructureRecord.create({
    data: {
      gouvernanceDepartementCode: '93',
      role: 'coporteur',
      structure: 'Orange',
      type: 'Entreprise privée',
    },
  })
}
