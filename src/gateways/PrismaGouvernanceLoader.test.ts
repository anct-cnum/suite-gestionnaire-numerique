import { PrismaGouvernanceLoader } from './PrismaGouvernanceLoader'
import { creerUnComite, creerUnDepartement, creerUneFeuilleDeRoute, creerUneGouvernance, creerUneRegion, creerUnMembre, creerUnMembreCommune, creerUnMembreDepartement, creerUnMembreEpci, creerUnMembreSgar, creerUnMembreStructure, creerUnUtilisateur } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTime, epochTimeMinusOneDay } from '@/shared/testHelper'
import { UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

describe('gouvernance loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand une gouvernance est demandée par son code département existant, alors elle est renvoyée', async () => {
    // GIVEN
    await creerUneRegion({ code: '11' })
    await creerUneRegion({ code: '53', nom: 'Bretagne' })
    await creerUnDepartement({ code: '93', nom: 'Seine-Saint-Denis' })
    await creerUnDepartement({ code: '75', nom: 'Paris' })
    await creerUnUtilisateur({ nom: 'Deschamps', prenom: 'Jean', ssoId: 'userFooId' })
    await creerUneGouvernance({ departementCode: '75' })
    await creerUneGouvernance({
      departementCode: '93',
      derniereEditionNoteDeContexte: epochTime.toISOString(),
      editeurNoteDeContexteId: 'userFooId',
      editeurNotePriveeId: 'userFooId',
      noteDeContexte: '<STRONG class="test">Note de contexte</STRONG><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
      notePrivee: {
        contenu: 'un contenu quelconque',
        derniereEdition: epochTime.toISOString(),
      },
    })
    await creerComites('93', 0)
    await creerComites('75', 2)
    await creerFeuillesDeRoute('93')
    await creerFeuillesDeRoute('75')
    await creerMembres('93')
    await creerMembres('75')

    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.get('93')

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      comites: [
        {
          commentaire: 'commentaire',
          date: epochTime,
          derniereEdition: epochTime,
          frequence: 'trimestrielle',
          id: 1,
          nomEditeur: 'Deschamps',
          prenomEditeur: 'Jean',
          type: 'stratégique',
        },
        {
          commentaire: 'commentaire',
          date: epochTimeMinusOneDay,
          derniereEdition: epochTime,
          frequence: 'trimestrielle',
          id: 2,
          nomEditeur: 'Deschamps',
          prenomEditeur: 'Jean',
          type: 'technique',
        },
      ],
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute,
      noteDeContexte: {
        dateDeModification: epochTime,
        nomAuteur: 'Deschamps',
        prenomAuteur: 'Jean',
        texte: '<STRONG class="test">Note de contexte</STRONG><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
      },
      notePrivee: {
        dateDEdition: epochTime,
        nomEditeur: 'Deschamps',
        prenomEditeur: 'Jean',
        texte: 'un contenu quelconque',
      },
      syntheseMembres,
      uid: '93',
    })
  })

  it('quand une gouvernance est demandée par son code département inexistant, alors elle n’est pas renvoyée', async () => {
    // GIVEN
    await creerUneRegion({ code: '11' })
    await creerUnDepartement({ code: '93', nom: 'Seine-Saint-Denis' })
    await creerUnDepartement({ code: '75', nom: 'Paris' })
    const codeDepartementInexistant = 'zzz'
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = gouvernanceLoader.get(codeDepartementInexistant)

    // THEN
    await expect(async () => gouvernanceReadModel).rejects.toThrow('Le département n’existe pas')
  })

  it('quand une gouvernance est demandée par son code département existant et qu’elle n’a pas de note de contexte ni comité ni note privée, alors elle est renvoyée sans note de contexte ni comité ni note privée', async () => {
    // GIVEN
    const codeDepartement = '93'
    await creerUneRegion({ code: '11' })
    await creerUneRegion({ code: '53', nom: 'Bretagne' })
    await creerUnDepartement({ code: codeDepartement, nom: 'Seine-Saint-Denis' })
    await creerUnDepartement({ code: '75', nom: 'Paris' })
    await creerUneGouvernance({ departementCode: codeDepartement })
    await creerFeuillesDeRoute(codeDepartement)
    await creerMembres('93')
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.get(codeDepartement)

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      comites: undefined,
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute,
      noteDeContexte: undefined,
      notePrivee: undefined,
      syntheseMembres,
      uid: codeDepartement,
    })
  })

  it('quand une gouvernance est demandée par son code département existant avec un comité sans date de prochain comité, alors elle est renvoyée sans date de prochain comité', async () => {
    // GIVEN
    const codeDepartement = '93'
    await creerUneRegion({ code: '11' })
    await creerUnDepartement({ code: codeDepartement })
    await creerUneGouvernance({ departementCode: codeDepartement })
    await creerUnUtilisateur({ nom: 'Deschamps', prenom: 'Jean', ssoId: 'userFooId' })
    await creerUnComite({
      commentaire: 'commentaire',
      creation: epochTime,
      date: undefined,
      derniereEdition: epochTime,
      editeurUtilisateurId: 'userFooId',
      frequence: 'trimestrielle',
      gouvernanceDepartementCode: codeDepartement,
      id: 1,
      type: 'stratégique',
    })
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.get(codeDepartement)

    // THEN
    expect(gouvernanceReadModel.comites).toStrictEqual<UneGouvernanceReadModel['comites']>(
      [
        {
          commentaire: 'commentaire',
          date: undefined,
          derniereEdition: epochTime,
          frequence: 'trimestrielle',
          id: 1,
          nomEditeur: 'Deschamps',
          prenomEditeur: 'Jean',
          type: 'stratégique',
        },
      ]
    )
  })

  it('quand une gouvernance est demandée par son code département existant avec un comité sans commentaire, alors elle est renvoyée sans commentaire', async () => {
    // GIVEN
    const codeDepartement = '93'
    await creerUneRegion({ code: '11' })
    await creerUnDepartement({ code: codeDepartement })
    await creerUneGouvernance({ departementCode: codeDepartement })
    await creerUnUtilisateur({ nom: 'Deschamps', prenom: 'Jean', ssoId: 'userFooId' })
    await creerUnComite({
      commentaire: '',
      creation: epochTime,
      date: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: 'userFooId',
      frequence: 'trimestrielle',
      gouvernanceDepartementCode: codeDepartement,
      id: 1,
      type: 'stratégique',
    })
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.get(codeDepartement)

    // THEN
    expect(gouvernanceReadModel.comites).toStrictEqual<UneGouvernanceReadModel['comites']>(
      [
        {
          commentaire: '',
          date: epochTime,
          derniereEdition: epochTime,
          frequence: 'trimestrielle',
          id: 1,
          nomEditeur: 'Deschamps',
          prenomEditeur: 'Jean',
          type: 'stratégique',
        },
      ]
    )
  })

  it('quand une gouvernance est demandée par son code département existant avec un comité sans éditeur, alors elle est renvoyée sans éditeur', async () => {
    // GIVEN
    const codeDepartement = '93'
    await creerUneRegion({ code: '11' })
    await creerUnDepartement({ code: codeDepartement })
    await creerUneGouvernance({ departementCode: codeDepartement })
    await creerUnUtilisateur()
    await creerUnComite({
      commentaire: 'commentaire',
      creation: epochTime,
      date: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: 'userFooId',
      frequence: 'trimestrielle',
      gouvernanceDepartementCode: codeDepartement,
      id: 1,
      type: 'stratégique',
    })

    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)

    // WHEN
    const gouvernanceReadModel = await gouvernanceLoader.get(codeDepartement)

    // THEN
    expect(gouvernanceReadModel.comites).toStrictEqual<UneGouvernanceReadModel['comites']>(
      [
        {
          commentaire: 'commentaire',
          date: epochTime,
          derniereEdition: epochTime,
          frequence: 'trimestrielle',
          id: 1,
          nomEditeur: 'Tartempion',
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
      { nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Structure' },
      { nom: 'CC des Monts du Lyonnais', roles: ['coporteur'], type: 'Structure' },
    ],
    beneficiairesSubventionFormation: [
      { nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Structure' },
      { nom: 'CC des Monts du Lyonnais', roles: ['coporteur'], type: 'Structure' },
    ],
    budgetGlobal: 145_000,
    montantSubventionAccorde: 5_000,
    montantSubventionDemande: 40_000,
    montantSubventionFormationAccorde: 5_000,
    nom: 'Feuille de route inclusion',
    porteur: { nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Administration' },
    totalActions: 3,
  },
  {
    beneficiairesSubvention: [
      { nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Structure' },
      { nom: 'CC des Monts du Lyonnais', roles: ['coporteur'], type: 'Structure' },
    ],
    beneficiairesSubventionFormation: [
      { nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Structure' },
      { nom: 'CC des Monts du Lyonnais', roles: ['coporteur'], type: 'Structure' },
    ],
    budgetGlobal: 145_000,
    montantSubventionAccorde: 5_000,
    montantSubventionDemande: 40_000,
    montantSubventionFormationAccorde: 5_000,
    nom: 'Feuille de route numérique du Rhône',
    porteur: { nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Administration' },
    totalActions: 3,
  },
]

const syntheseMembres: UneGouvernanceReadModel['syntheseMembres'] = {
  candidats: 0,
  coporteurs: [
    {
      nom: 'Bretagne',
      roles: ['coporteur'],
      type: 'Préfecture régionale',
    },
    {
      nom: 'CC Porte du Jura',
      roles: ['beneficiaire', 'coporteur'],
      type: 'Collectivité, EPCI',
    },
    {
      nom: 'Créteil',
      roles: ['coporteur'],
      type: 'Collectivité, commune',
    },
    {
      nom: 'Orange',
      roles: ['coporteur', 'recipiendaire'],
      type: 'Entreprise privée',
    },
    {
      nom: 'Seine-Saint-Denis',
      roles: ['coporteur'],
      type: 'Préfecture départementale',
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
  })),
  total: 9,
}

async function creerComites(gouvernanceDepartementCode: string, incrementId: number): Promise<void> {
  await creerUnComite({
    commentaire: 'commentaire',
    creation: epochTime,
    date: epochTime,
    derniereEdition: epochTime,
    editeurUtilisateurId: 'userFooId',
    frequence: 'trimestrielle',
    gouvernanceDepartementCode,
    id: 1 + Number(incrementId),
    type: 'stratégique',
  })
  await creerUnComite({
    commentaire: 'commentaire',
    creation: epochTime,
    date: epochTimeMinusOneDay,
    derniereEdition: epochTime,
    editeurUtilisateurId: 'userFooId',
    frequence: 'trimestrielle',
    gouvernanceDepartementCode,
    id: 2 + Number(incrementId),
    type: 'technique',
  })
}

async function creerFeuillesDeRoute(gouvernanceDepartementCode: string): Promise<void> {
  await creerUneFeuilleDeRoute({ gouvernanceDepartementCode })
  await creerUneFeuilleDeRoute({ gouvernanceDepartementCode, nom: 'Feuille de route numérique du Rhône' })
}

async function creerMembres(gouvernanceDepartementCode: string): Promise<void> {
  await creerUnMembre({
    gouvernanceDepartementCode,
    id: `commune-35345-${gouvernanceDepartementCode}`,
    type: 'Collectivité, commune',
  })
  await creerUnMembre({
    gouvernanceDepartementCode,
    id: `commune-94028-${gouvernanceDepartementCode}`,
    type: 'Collectivité, commune',
  })
  await creerUnMembre({
    gouvernanceDepartementCode,
    id: `epci-241927201-${gouvernanceDepartementCode}`,
    type: 'Collectivité, EPCI',
  })
  await creerUnMembre({
    gouvernanceDepartementCode,
    id: `epci-200072056-${gouvernanceDepartementCode}`,
    type: 'Collectivité, EPCI',
  })
  await creerUnMembre({
    gouvernanceDepartementCode,
    id: `structure-38012986643097-${gouvernanceDepartementCode}`,
    type: 'Entreprise privée',
  })
  await creerUnMembre({
    gouvernanceDepartementCode,
    id: `prefecture-${gouvernanceDepartementCode}`,
    type: 'Préfecture départementale',
  })
  await creerUnMembre({
    gouvernanceDepartementCode,
    id: `departement-69-${gouvernanceDepartementCode}`,
    type: 'Conseil départemental',
  })
  await creerUnMembre({
    gouvernanceDepartementCode,
    id: `region-53-${gouvernanceDepartementCode}`,
    type: 'Préfecture régionale',
  })
  await creerUnMembre({
    gouvernanceDepartementCode,
    id: `region-11-${gouvernanceDepartementCode}`,
    type: 'Préfecture régionale',
  })
  await creerUnMembreCommune({
    commune: 'Trévérien',
    membreId: `commune-35345-${gouvernanceDepartementCode}`,
    role: 'recipiendaire',
  })
  await creerUnMembreCommune({
    commune: 'Trévérien',
    membreId: `commune-35345-${gouvernanceDepartementCode}`,
    role: 'beneficiaire',
  })
  await creerUnMembreCommune({
    commune: 'Créteil',
    membreId: `commune-94028-${gouvernanceDepartementCode}`,
    role: 'coporteur',
  })
  await creerUnMembreDepartement({
    departementCode: gouvernanceDepartementCode,
    membreId: `departement-69-${gouvernanceDepartementCode}`,
    role: 'observateur',
  })
  await creerUnMembreDepartement({
    departementCode: gouvernanceDepartementCode,
    membreId: `prefecture-${gouvernanceDepartementCode}`,
    role: 'coporteur',
  })
  await creerUnMembreEpci({
    epci: 'CA Tulle Agglo',
    membreId: `epci-241927201-${gouvernanceDepartementCode}`,
    role: 'observateur',
  })
  await creerUnMembreEpci({
    epci: 'CC Porte du Jura',
    membreId: `epci-200072056-${gouvernanceDepartementCode}`,
    role: 'coporteur',
  })
  await creerUnMembreEpci({
    epci: 'CC Porte du Jura',
    membreId: `epci-200072056-${gouvernanceDepartementCode}`,
    role: 'beneficiaire',
  })
  await creerUnMembreSgar({
    membreId: `region-11-${gouvernanceDepartementCode}`,
    role: 'observateur',
    sgarCode: '11',
  })
  await creerUnMembreSgar({
    membreId: `region-53-${gouvernanceDepartementCode}`,
    role: 'coporteur',
    sgarCode: '53',
  })
  await creerUnMembreStructure({
    membreId: `structure-38012986643097-${gouvernanceDepartementCode}`,
    role: 'recipiendaire',
    structure: 'Orange',
  })
  await creerUnMembreStructure({
    membreId: `structure-38012986643097-${gouvernanceDepartementCode}`,
    role: 'coporteur',
    structure: 'Orange',
  })
}
