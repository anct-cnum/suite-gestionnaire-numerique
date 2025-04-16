import { Prisma } from '@prisma/client'

import { PrismaGouvernanceLoader } from './PrismaGouvernanceLoader'
import { creerMembres, creerUnBeneficiaireSubvention, creerUnComite, creerUnDepartement, creerUneAction, creerUneDemandeDeSubvention, creerUneEnveloppeFinancement, creerUneFeuilleDeRoute, creerUneGouvernance, creerUneRegion, creerUnUtilisateur } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTime, epochTimeMinusOneDay } from '@/shared/testHelper'
import { UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'
import { Gouvernance, SyntheseGouvernance } from '@/use-cases/services/shared/etablisseur-synthese-gouvernance'

describe('gouvernance loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand une gouvernance est demandée par son code département existant, alors elle est renvoyée', async () => {
    // GIVEN
    await creerUneRegion({ code: '11' })
    await creerUneRegion({ code: '53', nom: 'Bretagne' })
    await creerUnDepartement({ code: '93', nom: 'Seine-Saint-Denis' })
    await creerUnDepartement({ code: '75', nom: 'Paris' })
    await creerUnUtilisateur({ id: 0, nom: 'Deschamps', prenom: 'Jean', ssoId: 'userFooId' })
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
    await creerMembres('93')
    await creerMembres('75')
    await creerFeuillesDeRoute('93', 0)
    await creerFeuillesDeRoute('75', 2)
    await creerFeuillesDeRoute('93', 4)
    await creerUneAction({
      budgetGlobal: 70_000,
      createurId: 0,
      feuilleDeRouteId: 1,
      id: 1,
      nom: 'Structurer une filière de reconditionnement locale 1',
    })
    await creerUneAction({
      budgetGlobal: 25_000,
      createurId: 0,
      feuilleDeRouteId: 2,
      id: 2,
      nom: 'Organiser un marathon',
    })
    await creerUneAction({
      budgetGlobal: 55_500,
      createurId: 0,
      feuilleDeRouteId: 6,
      id: 3,
      nom: 'Structurer une filière de reconditionnement locale 2',
    })
    await creerUneAction({
      budgetGlobal: 55_500,
      createurId: 0,
      feuilleDeRouteId: 6,
      id: 4,
      nom: 'Structurer une filière de reconditionnement locale 2',
    })
    await creerUneEnveloppeFinancement({ id: 1 })
    await creerUneEnveloppeFinancement({ id: 2, libelle: 'Enveloppe de formation' })
    await creerUneDemandeDeSubvention({ actionId: 1, createurId: 0, enveloppeFinancementId: 1, id: 1 })
    await creerUneDemandeDeSubvention({
      actionId: 3,
      createurId: 0,
      enveloppeFinancementId: 1,
      id: 2,
      subventionDemandee: 25_000,
      subventionEtp: 8_999,
      subventionPrestation: 21_001,
    })
    await creerUneDemandeDeSubvention({
      actionId: 4,
      createurId: 0,
      enveloppeFinancementId: 2,
      id: 3,
      subventionDemandee: 50,
      subventionEtp: 17.65,
      subventionPrestation: 1.5,
    })
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: 1,
      membreId: 'commune-94028-93',
    })
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: 1,
      membreId: 'epci-200072056-93',
    })
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: 3,
      membreId: 'structure-38012986643097-93',
    })

    // WHEN
    const gouvernanceReadModel = await new PrismaGouvernanceLoader(dummyEtablisseurSyntheseGouvernance).get('93')

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
      feuillesDeRoute: [
        {
          beneficiairesSubvention: [
            { nom: 'CC Porte du Jura', uid: 'epci-200072056-93' },
            { nom: 'Créteil', uid: 'commune-94028-93' },
          ],
          beneficiairesSubventionFormation: [],
          budgetGlobal: 0,
          montantSubventionAccordee: 0,
          montantSubventionDemandee: 0,
          montantSubventionFormationAccordee: 0,
          nom: 'Feuille de route inclusion 1',
          pieceJointe: {
            apercu: '',
            emplacement: '',
            nom: 'feuille-de-route-fake.pdf',
          },
          porteur: undefined,
          totalActions: 1,
          uid: '1',
        },
        {
          beneficiairesSubvention: [],
          beneficiairesSubventionFormation: [],
          budgetGlobal: 0,
          montantSubventionAccordee: 0,
          montantSubventionDemandee: 0,
          montantSubventionFormationAccordee: 0,
          nom: 'Feuille de route numérique du Rhône 2',
          porteur: {
            nom: 'Trévérien',
            uid: 'commune-35345-93',
          },
          totalActions: 1,
          uid: '2',
        },
        {
          beneficiairesSubvention: [],
          beneficiairesSubventionFormation: [],
          budgetGlobal: 0,
          montantSubventionAccordee: 0,
          montantSubventionDemandee: 0,
          montantSubventionFormationAccordee: 0,
          nom: 'Feuille de route inclusion 5',
          pieceJointe: {
            apercu: '',
            emplacement: '',
            nom: 'feuille-de-route-fake.pdf',
          },
          porteur: undefined,
          totalActions: 0,
          uid: '5',
        },
        {
          beneficiairesSubvention: [],
          beneficiairesSubventionFormation: [{
            nom: 'Orange',
            uid: 'structure-38012986643097-93',
          }],
          budgetGlobal: 0,
          montantSubventionAccordee: 0,
          montantSubventionDemandee: 0,
          montantSubventionFormationAccordee: 0,
          nom: 'Feuille de route numérique du Rhône 6',
          porteur: {
            nom: 'Trévérien',
            uid: 'commune-35345-93',
          },
          totalActions: 2,
          uid: '6',
        },
      ],
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
      peutVoirNotePrivee: false,
      syntheseMembres: {
        candidats: 2,
        coporteurs: [
          {
            feuillesDeRoute: [],
            nom: 'Bretagne',
            roles: ['coporteur'],
            type: 'Préfecture régionale',
            uid: 'region-53-93',
          },
          {
            feuillesDeRoute: [],
            nom: 'CC Porte du Jura',
            roles: ['beneficiaire', 'coporteur'],
            type: 'Collectivité, EPCI',
            uid: 'epci-200072056-93',
          },
          {
            feuillesDeRoute: [],
            nom: 'Créteil',
            roles: ['coporteur'],
            type: 'Collectivité, commune',
            uid: 'commune-94028-93',
          },
          {
            feuillesDeRoute: [],
            nom: 'Orange',
            roles: ['coporteur', 'recipiendaire'],
            type: 'Entreprise privée',
            uid: 'structure-38012986643097-93',
          },
          {
            feuillesDeRoute: [],
            nom: 'Seine-Saint-Denis',
            roles: ['coporteur'],
            type: 'Préfecture départementale',
            uid: 'prefecture-93',
          },
          {
            feuillesDeRoute: [
              {
                nom: 'Feuille de route numérique du Rhône 2',
                uid: '2',
              },
              {
                nom: 'Feuille de route numérique du Rhône 6',
                uid: '6',
              },
            ],
            nom: 'Trévérien',
            roles: ['beneficiaire', 'coporteur', 'recipiendaire'],
            totalMontantsSubventionsAccordees: 0,
            totalMontantsSubventionsFormationAccordees: 0,
            type: '',
            uid: 'commune-35345-93',
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
          links: {},
          totalMontantsSubventionsAccordees: 0,
          totalMontantsSubventionsFormationAccordees: 0,
          ...partialMembre,
        })),
        total: 9,
      },
      uid: '93',
    })
  })

  it('quand une gouvernance est demandée par son code département inexistant, alors une erreur est levée', async () => {
    // GIVEN
    await creerUneRegion({ code: '11' })
    await creerUnDepartement({ code: '75', nom: 'Paris' })
    const codeDepartementInexistant = 'zzz'

    // WHEN
    const gouvernanceReadModel = new PrismaGouvernanceLoader(dummyEtablisseurSyntheseGouvernance)
      .get(codeDepartementInexistant)

    // THEN
    await expect(gouvernanceReadModel).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    await expect(gouvernanceReadModel).rejects.toMatchObject({ code: 'P2025' })
  })

  it('quand une gouvernance est demandée par son code département existant et qu’elle n’a pas de note de contexte ni comité ni note privée, alors elle est renvoyée sans note de contexte ni comité ni note privée', async () => {
    // GIVEN
    await creerUneRegion({ code: '11' })
    await creerUneRegion({ code: '53', nom: 'Bretagne' })
    await creerUnDepartement({ code: '93', nom: 'Seine-Saint-Denis' })
    await creerUnDepartement({ code: '75', nom: 'Paris' })
    await creerUneGouvernance({ departementCode: '93' })
    await creerMembres('93')
    await creerFeuillesDeRoute('93', 0)
    await creerUnUtilisateur({ id: 0, nom: 'Deschamps', prenom: 'Jean', ssoId: 'userFooId' })
    await creerUneAction({
      budgetGlobal: 70_000,
      createurId: 0,
      feuilleDeRouteId: 1,
      id: 1,
      nom: 'Structurer une filière de reconditionnement locale 1',
    })
    await creerUneEnveloppeFinancement({ id: 1 })
    await creerUneDemandeDeSubvention({
      actionId: 1,
      createurId: 0,
      enveloppeFinancementId: 1,
      id: 1,
      subventionDemandee: 30_000,
      subventionEtp: 10_000,
      subventionPrestation: 20_000,
    })
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: 1,
      membreId: 'commune-94028-93',
    })
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: 1,
      membreId: 'epci-200072056-93',
    })

    // WHEN
    const gouvernanceReadModel = await new PrismaGouvernanceLoader(dummyEtablisseurSyntheseGouvernance).get('93')

    // THEN
    expect(gouvernanceReadModel).toStrictEqual<UneGouvernanceReadModel>({
      comites: undefined,
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute: [
        {
          beneficiairesSubvention: [
            { nom: 'CC Porte du Jura', uid: 'epci-200072056-93' },
            { nom: 'Créteil', uid: 'commune-94028-93' },
          ],
          beneficiairesSubventionFormation: [],
          budgetGlobal: 0,
          montantSubventionAccordee: 0,
          montantSubventionDemandee: 0,
          montantSubventionFormationAccordee: 0,
          nom: 'Feuille de route inclusion 1',
          pieceJointe: {
            apercu: '',
            emplacement: '',
            nom: 'feuille-de-route-fake.pdf',
          },
          porteur: undefined,
          totalActions: 1,
          uid: '1',
        },
        {
          beneficiairesSubvention: [],
          beneficiairesSubventionFormation: [],
          budgetGlobal: 0,
          montantSubventionAccordee: 0,
          montantSubventionDemandee: 0,
          montantSubventionFormationAccordee: 0,
          nom: 'Feuille de route numérique du Rhône 2',
          porteur: {
            nom: 'Trévérien',
            uid: 'commune-35345-93',
          },
          totalActions: 0,
          uid: '2',
        },
      ],
      noteDeContexte: undefined,
      notePrivee: undefined,
      peutVoirNotePrivee: false,
      syntheseMembres: {
        candidats: 2,
        coporteurs: [
          {
            feuillesDeRoute: [],
            nom: 'Bretagne',
            roles: ['coporteur'],
            type: 'Préfecture régionale',
            uid: 'region-53-93',
          },
          {
            feuillesDeRoute: [],
            nom: 'CC Porte du Jura',
            roles: ['beneficiaire', 'coporteur'],
            type: 'Collectivité, EPCI',
            uid: 'epci-200072056-93',
          },
          {
            feuillesDeRoute: [],
            nom: 'Créteil',
            roles: ['coporteur'],
            type: 'Collectivité, commune',
            uid: 'commune-94028-93',
          },
          {
            feuillesDeRoute: [],
            nom: 'Orange',
            roles: ['coporteur', 'recipiendaire'],
            type: 'Entreprise privée',
            uid: 'structure-38012986643097-93',
          },
          {
            feuillesDeRoute: [],
            nom: 'Seine-Saint-Denis',
            roles: ['coporteur'],
            type: 'Préfecture départementale',
            uid: 'prefecture-93',
          },
          {
            feuillesDeRoute: [
              {
                nom: 'Feuille de route numérique du Rhône 2',
                uid: '2',
              },
            ],
            nom: 'Trévérien',
            roles: ['beneficiaire', 'coporteur', 'recipiendaire'],
            type: '',
            "uid": "commune-35345-93"
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
          links: {},
          totalMontantsSubventionsAccordees: 0,
          totalMontantsSubventionsFormationAccordees: 0,
          ...partialMembre,
        })),
        total: 9,
      },
      uid: '93',
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
    const gouvernanceReadModel = await new PrismaGouvernanceLoader(dummyEtablisseurSyntheseGouvernance)
      .get(codeDepartement)

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
    const gouvernanceReadModel = await new PrismaGouvernanceLoader(dummyEtablisseurSyntheseGouvernance)
      .get(codeDepartement)

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
    const gouvernanceReadModel = await new PrismaGouvernanceLoader(dummyEtablisseurSyntheseGouvernance)
      .get(codeDepartement)

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
  const id1 = 1 + incrementId
  const id2 = 2 + incrementId
  await creerUneFeuilleDeRoute({
    gouvernanceDepartementCode,
    id: id1,
    nom: `Feuille de route inclusion ${id1}`,
    pieceJointe: 'feuille-de-route-fake.pdf',
  })
  await creerUneFeuilleDeRoute({
    gouvernanceDepartementCode,
    id: id2,
    nom: `Feuille de route numérique du Rhône ${id2}`,
    porteurId: 'commune-35345-93',
  })
}

function dummyEtablisseurSyntheseGouvernance(gouvernance: Gouvernance): SyntheseGouvernance {
  return {
    beneficiaires: 0,
    budget: 0,
    coFinancement: 0,
    coFinanceurs: 0,
    feuillesDeRoute: gouvernance.feuillesDeRoute.map(feuilleDeRoute => ({
      actions: feuilleDeRoute.actions.map(action => ({
        beneficiaires: 0,
        budget: action.budgetGlobal,
        coFinancement: 0,
        coFinanceurs: 0,
        financementAccorde: 0,
        financementDemande: 0,
        financementFormationAccorde: 0,
        uid: action.uid,
      })),
      beneficiaires: 0,
      budget: 0,
      coFinancement: 0,
      coFinanceurs: 0,
      financementAccorde: 0,
      financementDemande: 0,
      financementFormationAccorde: 0,
      uid: feuilleDeRoute.uid,
    })),
    financementAccorde: 0,
    financementDemande: 0,
    financementFormationAccorde: 0,
  }
}
