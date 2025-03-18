import { PrismaLesFeuillesDeRouteLoader } from './PrismaLesFeuillesDeRouteLoader'
import { creerMembres, creerUnBeneficiaireSubvention, creerUnCoFinancement, creerUnContact, creerUnDepartement, creerUneAction, creerUneDemandeDeSubvention, creerUneEnveloppeFinancement, creerUneFeuilleDeRoute, creerUneGouvernance, creerUneRegion, creerUnMembre, creerUnMembreStructure, creerUnPorteurAction, creerUnUtilisateur } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTime, epochTimeMinusTwoDays } from '@/shared/testHelper'
import { FeuillesDeRouteReadModel } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

describe('récupérer les feuilles de route loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand une liste de feuilles de route est demandée par son code département existant, alors elle est renvoyée triée par ordre de création décroissant', async () => {
    // GIVEN
    await creerUneRegion({ code: '84', nom: 'Auvergne-Rhône-Alpes' })
    await creerUneRegion({ code: '53', nom: 'Bretagne' })
    await creerUneRegion({ code: '11', nom: 'Île-de-France' })
    await creerUnDepartement({ code: '93', nom: 'Seine-Saint-Denis' })
    await creerUnDepartement({ code: '75' })
    await creerUneGouvernance({ departementCode: '93' })
    await creerUneGouvernance({ departementCode: '75' })
    await creerUnUtilisateur({ id: 1 })
    await creerUnContact({
      email: 'contact@example.com',
      fonction: 'Directeur',
      nom: 'Dupont',
      prenom: 'Jean',
    })
    await creerUnContact({
      email: 'structure@example.com',
      fonction: 'Directeur',
      nom: 'Tartempion',
      prenom: 'Michel',
    })
    await creerMembres('93')
    await creerUnMembre({
      contact: 'contact@example.com',
      gouvernanceDepartementCode: '93',
      id: 'structure-79227291600034-93',
    })
    await creerUnMembre({
      contact: 'contact@example.com',
      gouvernanceDepartementCode: '75',
      id: 'structure-79227291600034-75',
      statut: 'confirme',
    })
    await creerUnMembreStructure({
      membreId: 'structure-79227291600034-93',
      role: 'formation',
      structure: 'Emmaüs Connect',
    })
    await creerUnMembreStructure({
      membreId: 'structure-79227291600034-75',
      role: 'coporteur',
      structure: 'Emmaüs Connect',
    })
    await creerUneFeuilleDeRoute({
      creation: epochTimeMinusTwoDays,
      gouvernanceDepartementCode: '93',
      id: 1,
      nom: 'Feuille de route 1',
      porteurId: 'epci-200072056-93',
    })
    await creerUneFeuilleDeRoute({
      gouvernanceDepartementCode: '93',
      id: 2,
      nom: 'Feuille de route 2',
    })
    await creerUneFeuilleDeRoute({ creation: epochTime, gouvernanceDepartementCode: '75', id: 3, nom: 'fdr3' })
    await creerUneAction({
      budgetGlobal: 70_000,
      createurId: 1,
      feuilleDeRouteId: 1,
      id: 1,
      nom: 'Structurer une filière de reconditionnement locale 1',
    })
    await creerUneAction({
      budgetGlobal: 70_000,
      createurId: 1,
      feuilleDeRouteId: 2,
      id: 3,
      nom: 'Structurer une filière de reconditionnement locale 3',
    })
    await creerUneAction({
      budgetGlobal: 70_000,
      createurId: 1,
      feuilleDeRouteId: 2,
      id: 4,
      nom: 'Structurer une filière de reconditionnement locale 4',
    })
    await creerUneEnveloppeFinancement({ id: 1 })
    await creerUneDemandeDeSubvention({ actionId: 1, createurId: 1, enveloppeFinancementId: 1, id: 1 })
    await creerUneDemandeDeSubvention({
      actionId: 3,
      createurId: 1,
      enveloppeFinancementId: 1,
      id: 2,
      subventionEtp: 9_000,
      subventionPrestation: 0,
    })
    await creerUnPorteurAction({ actionId: 1, membreId: 'epci-241927201-93' })
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: 1,
      membreId: 'commune-35345-93',
    })
    await creerUnCoFinancement({ actionId: 1, memberId: 'commune-113-93', montant: 15_000 })
    await creerUnCoFinancement({ actionId: 3, memberId: 'structure-79227291600034-93', montant: 25_000 })

    // WHEN
    const feuillesDeRouteReadModel = await new PrismaLesFeuillesDeRouteLoader().feuillesDeRoute('93')

    // THEN
    expect(feuillesDeRouteReadModel).toStrictEqual<FeuillesDeRouteReadModel>({
      feuillesDeRoute: [
        {
          actions: [
            {
              beneficiaires: [],
              besoins: ['besoin 1', 'besoin 2'],
              budgetGlobal: 70_000,
              coFinancements: [
                {
                  coFinanceur: {
                    nom: 'Emmaüs Connect',
                    uid: 'structure-79227291600034-93',
                  },
                  montant: 25000,
                },
              ],
              contexte: "Contexte de l'action",
              description: "Description détaillée de l'action",
              nom: 'Structurer une filière de reconditionnement locale 3',
              porteurs: [],
              subvention: {
                enveloppe: 'Enveloppe test',
                montants: {
                  prestation: 0,
                  ressourcesHumaines: 9_000,
                },
                statut: 'deposee',
              },
              totaux: {
                coFinancement: 0,
                financementAccorde: 0,
              },
              uid: '3',
            },
            {
              beneficiaires: [],
              besoins: ['besoin 1', 'besoin 2'],
              budgetGlobal: 70_000,
              coFinancements: [],
              contexte: "Contexte de l'action",
              description: "Description détaillée de l'action",
              nom: 'Structurer une filière de reconditionnement locale 4',
              porteurs: [],
              subvention: undefined,
              totaux: {
                coFinancement: 0,
                financementAccorde: 0,
              },
              uid: '4',
            },
          ],
          beneficiaires: 0,
          coFinanceurs: 0,
          nom: 'Feuille de route 2',
          structureCoPorteuse: undefined,
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
              beneficiaires: [
                {
                  nom: 'Trévérien',
                  uid: 'commune-35345-93',
                },
              ],
              besoins: ['besoin 1', 'besoin 2'],
              budgetGlobal: 70_000,
              coFinancements: [
                {
                  coFinanceur: {
                    nom: 'Pipriac',
                    uid: 'commune-113-93',
                  },
                  montant: 15_000,
                },
              ],
              contexte: "Contexte de l'action",
              description: "Description détaillée de l'action",
              nom: 'Structurer une filière de reconditionnement locale 1',
              porteurs: [
                {
                  nom: 'CA Tulle Agglo',
                  uid: 'epci-241927201-93',
                },
              ],
              subvention: {
                enveloppe: 'Enveloppe test',
                montants: {
                  prestation: 0,
                  ressourcesHumaines: 0,
                },
                statut: 'deposee',
              },
              totaux: {
                coFinancement: 0,
                financementAccorde: 0,
              },
              uid: '1',
            },
          ],
          beneficiaires: 0,
          coFinanceurs: 0,
          nom: 'Feuille de route 1',
          structureCoPorteuse: {
            nom: 'CC Porte du Jura',
            uid: 'epci-200072056-93',
          },
          totaux: {
            budget: 0,
            coFinancement: 0,
            financementAccorde: 0,
          },
          uid: '1',
        },
      ],
      porteursPotentielsNouvellesFeuillesDeRouteOuActions: [
        {
          nom: 'Bretagne',
          roles: ['coporteur'],
          uid: 'region-53-93',
        },
        {
          nom: 'CA Tulle Agglo',
          roles: ['observateur'],
          uid: 'epci-241927201-93',
        },
        {
          nom: 'CC Porte du Jura',
          roles: ['beneficiaire', 'coporteur'],
          uid: 'epci-200072056-93',
        },
        {
          nom: 'Créteil',
          roles: ['coporteur'],
          uid: 'commune-94028-93',
        },
        {
          nom: 'Emmaüs Connect',
          roles: [
            'formation',
          ],
          uid: 'structure-79227291600034-93',
        },
        {
          nom: 'Île-de-France',
          roles: ['observateur'],
          uid: 'region-11-93',
        },
        {
          nom: 'Orange',
          roles: ['coporteur', 'recipiendaire'],
          uid: 'structure-38012986643097-93',
        },
        {
          nom: 'Seine-Saint-Denis',
          roles: ['observateur'],
          uid: 'departement-69-93',
        },
        {
          nom: 'Seine-Saint-Denis',
          roles: ['coporteur'],
          uid: 'prefecture-93',
        },
        {
          nom: 'Trévérien',
          roles: [
            'beneficiaire',
            'coporteur',
            'recipiendaire',
          ],
          uid: 'commune-35345-93',
        },
      ],
      totaux: {
        budget: 0,
        coFinancement: 0,
        financementAccorde: 0,
      },
      uidGouvernance: '93',
    })
  })
})
