import { Prisma } from '@prisma/client'

import { PrismaGouvernanceLoader } from './PrismaGouvernanceLoader'
import { creerMembres, creerUnComite, creerUnDepartement, creerUneFeuilleDeRoute, creerUneGouvernance, creerUneRegion, creerUnUtilisateur } from './testHelper'
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
    await creerFeuillesDeRoute('93', 0)
    await creerFeuillesDeRoute('75', 2)
    await creerMembres('93')
    await creerMembres('75')

    // WHEN
    const gouvernanceReadModel = await new PrismaGouvernanceLoader().get('93')

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
      peutVoirNotePrivee: true,
      syntheseMembres,
      uid: '93',
    })
  })

  it('quand une gouvernance est demandée par son code département inexistant, alors une erreur est levée', async () => {
    // GIVEN
    await creerUneRegion({ code: '11' })
    await creerUnDepartement({ code: '75', nom: 'Paris' })
    const codeDepartementInexistant = 'zzz'

    // WHEN
    const gouvernanceReadModel = new PrismaGouvernanceLoader().get(codeDepartementInexistant)

    // THEN
    await expect(gouvernanceReadModel).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    await expect(gouvernanceReadModel).rejects.toMatchObject({ code: 'P2025' })
  })

  it('quand une gouvernance est demandée par son code département existant et qu’elle n’a pas de note de contexte ni comité ni note privée, alors elle est renvoyée sans note de contexte ni comité ni note privée', async () => {
    // GIVEN
    const codeDepartement = '93'
    await creerUneRegion({ code: '11' })
    await creerUneRegion({ code: '53', nom: 'Bretagne' })
    await creerUnDepartement({ code: codeDepartement, nom: 'Seine-Saint-Denis' })
    await creerUnDepartement({ code: '75', nom: 'Paris' })
    await creerUneGouvernance({ departementCode: codeDepartement })
    await creerFeuillesDeRoute(codeDepartement, 0)
    await creerMembres('93')

    // WHEN
    const gouvernanceReadModel = await new PrismaGouvernanceLoader().get(codeDepartement)

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      comites: undefined,
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute,
      noteDeContexte: undefined,
      notePrivee: undefined,
      peutVoirNotePrivee: true,
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

    // WHEN
    const gouvernanceReadModel = await new PrismaGouvernanceLoader().get(codeDepartement)

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
      commentaire: undefined,
      creation: epochTime,
      date: epochTime,
      derniereEdition: epochTime,
      editeurUtilisateurId: 'userFooId',
      frequence: 'trimestrielle',
      gouvernanceDepartementCode: codeDepartement,
      id: 1,
      type: 'stratégique',
    })

    // WHEN
    const gouvernanceReadModel = await new PrismaGouvernanceLoader().get(codeDepartement)

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

    // WHEN
    const gouvernanceReadModel = await new PrismaGouvernanceLoader().get(codeDepartement)

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
    pieceJointe: {
      apercu: '',
      emplacement: '',
      nom: 'feuille-de-route-fake.pdf',
    },
    porteur: { nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Administration' },
    totalActions: 3,
    uid: '1',
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
    uid: '2',
  },
]

const syntheseMembres: UneGouvernanceReadModel['syntheseMembres'] = {
  candidats: 2,
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
    {
      nom: 'Trévérien',
      roles: ['beneficiaire', 'coporteur', 'recipiendaire'],
      type: '',
    },
  ].map((partialMembre) => ({
    contactReferent: {
      denomination: 'Contact référent',
      mailContact: 'commune-35345-93@example.com',
      nom: 'Tartempion',
      poste: 'Directeur',
      prenom: 'Michel',
    },
    contactTechnique: undefined,
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
    id: 1 + incrementId,
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
    id: 2 + incrementId,
    type: 'technique',
  })
}

async function creerFeuillesDeRoute(gouvernanceDepartementCode: string, incrementId: number): Promise<void> {
  await creerUneFeuilleDeRoute({ gouvernanceDepartementCode, id: 1 + incrementId, pieceJointe: 'feuille-de-route-fake.pdf' })
  await creerUneFeuilleDeRoute({ gouvernanceDepartementCode, id: 2 + incrementId, nom: 'Feuille de route numérique du Rhône' })
}
