import { Prisma } from '@prisma/client'

import { PrismaUneFeuilleDeRouteLoader } from './PrismaUneFeuilleDeRouteLoader'
import { creerUnBeneficiaireSubvention, creerUnCoFinancement, creerUnContact, creerUnDepartement, creerUneAction, creerUneDemandeDeSubvention, creerUneEnveloppeFinancement, creerUneFeuilleDeRoute, creerUneGouvernance, creerUneRegion, creerUnMembre, creerUnMembreEpci, creerUnPorteurAction, creerUnUtilisateur } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTimeMinusTwoDays } from '@/shared/testHelper'
import { UneFeuilleDeRouteReadModel } from '@/use-cases/queries/RecupererUneFeuilleDeRoute'
import { Gouvernance, SyntheseGouvernance } from '@/use-cases/services/shared/etablisseur-synthese-gouvernance'

describe('récupérer une feuille de route loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand une feuille de route est demandée par son identifiant unique existant, alors elle est renvoyée', async () => {
    // GIVEN
    await creerUneRegion({ code: '11' })
    await creerUnDepartement({ code: codeDepartement })
    await creerUneGouvernance({ departementCode: codeDepartement })
    await creerUnUtilisateur({ id: uidUtilisateur })

    await creerMembre(uidPorteur, 'Emmaüs Connect')
    await creerUneFeuilleDeRoute({
      creation: epochTimeMinusTwoDays,
      gouvernanceDepartementCode: codeDepartement,
      id: Number(uidFeuilleDeRoute),
      nom: 'Feuille de route 1',
      pieceJointe: 'user/fooId/feuille-de-route-fake.pdf',
      porteurId: uidPorteur,
    })
    await creerAction(uidAction1, true)
    await creerAction(uidAction2, false)

    await creerUneFeuilleDeRoute({
      gouvernanceDepartementCode: codeDepartement,
      id: 2,
      nom: 'Feuille de route 2',
    })

    // WHEN
    const readModel = await new PrismaUneFeuilleDeRouteLoader(dummyEtablisseurSyntheseGouvernance)
      .get(uidFeuilleDeRoute)

    // THEN
    expect(readModel).toStrictEqual<UneFeuilleDeRouteReadModel>({
      actions: [
        {
          beneficiaire: 0,
          besoins: ['besoin 1', 'besoin 2'],
          budgetPrevisionnel: 70_000,
          coFinancement: {
            financeur: 0,
            montant: 0,
          },
          enveloppe: {
            libelle: 'Formation Aidant Numérique/Aidants Connect',
            montant: 0,
          },
          isEditable: false,
          isEnveloppeFormation: true,
          nom: 'Structurer une filière de reconditionnement locale 1',
          porteurs: [
            {
              nom: 'La Poste',
              uid: 'epci-2419272011-93',
            },
          ],
          statut: 'acceptee',
          uid: String(uidAction1),
        },
        {
          beneficiaire: 0,
          besoins: ['besoin 1', 'besoin 2'],
          budgetPrevisionnel: 70_000,
          coFinancement: {
            financeur: 0,
            montant: 0,
          },
          enveloppe: {
            libelle: 'Aucune enveloppe',
            montant: 0,
          },
          isEditable: true,
          isEnveloppeFormation: false,
          nom: 'Structurer une filière de reconditionnement locale 1',
          porteurs: [],
          statut: 'enCours',
          uid: String(uidAction2),
        },
      ],
      beneficiaire: 0,
      budgetTotalActions: 0,
      coFinanceur: 0,
      contextualisation: '<p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p>',
      document: {
        chemin: 'user/fooId/feuille-de-route-fake.pdf',
        nom: 'feuille-de-route-fake.pdf',
      },
      edition: {
        date: epochTimeMinusTwoDays,
        nom: '~',
        prenom: '~',
      },
      montantCofinancements: 0,
      montantFinancementsAccordes: 0,
      nom: 'Feuille de route 1',
      perimetre: 'Périmètre départemental',
      porteur: {
        nom: 'Emmaüs Connect',
        uid: uidPorteur,
      },
      uid: uidFeuilleDeRoute,
      uidGouvernance: codeDepartement,
    })
  })

  it('quand une feuille de route est demandée par son identifiant unique sans porteur, alors elle est renvoyée sans porteur', async () => {
    // GIVEN
    await creerUneRegion({ code: '11' })
    await creerUnDepartement({ code: codeDepartement })
    await creerUneGouvernance({ departementCode: codeDepartement })
    await creerUnUtilisateur({ id: uidUtilisateur })

    await creerUneFeuilleDeRoute({
      gouvernanceDepartementCode: codeDepartement,
      id: Number(uidFeuilleDeRoute),
      nom: 'Feuille de route 1',
      porteurId: null,
    })

    // WHEN
    const readModel = await new PrismaUneFeuilleDeRouteLoader(dummyEtablisseurSyntheseGouvernance)
      .get(uidFeuilleDeRoute)

    // THEN
    expect(readModel.porteur).toBeUndefined()
  })

  it('quand une feuille de route est demandée par son identifiant unique sans document, alors elle est renvoyée sans document', async () => {
    // GIVEN
    await creerUneRegion({ code: '11' })
    await creerUnDepartement({ code: codeDepartement })
    await creerUneGouvernance({ departementCode: codeDepartement })
    await creerUnUtilisateur({ id: uidUtilisateur })

    await creerUneFeuilleDeRoute({
      gouvernanceDepartementCode: codeDepartement,
      id: Number(uidFeuilleDeRoute),
      nom: 'Feuille de route 1',
      pieceJointe: null,
    })

    // WHEN
    const readModel = await new PrismaUneFeuilleDeRouteLoader(dummyEtablisseurSyntheseGouvernance)
      .get(uidFeuilleDeRoute)

    // THEN
    expect(readModel.document).toBeUndefined()
  })

  it('quand une feuille de route est demandée pour son identifiant unique non existant, alors une exception est levée', async () => {
    // GIVEN
    await creerUneRegion({ code: '11' })
    await creerUnDepartement({ code: codeDepartement })
    await creerUneGouvernance({ departementCode: codeDepartement })
    await creerUnUtilisateur({ id: uidUtilisateur })

    await creerUneFeuilleDeRoute({
      gouvernanceDepartementCode: codeDepartement,
      id: Number(uidFeuilleDeRoute),
      nom: 'Feuille de route 1',
      pieceJointe: null,
    })

    // WHEN
    const readModel = new PrismaUneFeuilleDeRouteLoader(dummyEtablisseurSyntheseGouvernance).get('999')

    // THEN
    await expect(readModel).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    await expect(readModel).rejects.toMatchObject({ code: 'P2025' })
  })
})

const codeDepartement = '93'
const uidPorteur = 'epci-200072056-93'
const uidFeuilleDeRoute = '1'
const uidUtilisateur = 1
const uidAction1 = 1
const uidAction2 = 2

async function creerAction(uidAction: number, withSubvention: boolean): Promise<void> {
  const uidEnveloppeFinancement = uidAction + 1
  const uidDemandeSubvention = uidAction + 2

  await creerUneAction({
    besoins: ['besoin_1', 'besoin_2'],
    budgetGlobal: 70_000,
    createurId: uidUtilisateur,
    feuilleDeRouteId: Number(uidFeuilleDeRoute),
    id: uidAction,
    nom: 'Structurer une filière de reconditionnement locale 1',
  })

  if (withSubvention) {
    await creerUneEnveloppeFinancement({
      id: uidEnveloppeFinancement,
      libelle: 'Formation Aidant Numérique/Aidants Connect',
      montant: 10_000,
    })
    await creerUneDemandeDeSubvention({
      actionId: uidAction,
      createurId: uidUtilisateur,
      enveloppeFinancementId: uidEnveloppeFinancement,
      id: uidDemandeSubvention,
      statut: 'acceptee',
    })

    const uidPorteurAction = `epci-241927201${uidAction}-93`
    await creerMembre(uidPorteurAction, 'La Poste')
    await creerUnPorteurAction({ actionId: uidAction, membreId: uidPorteurAction })

    const uidBeneficiaireSubvention1 = `commune-35346${uidAction}-93`
    await creerMembre(uidBeneficiaireSubvention1)
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: uidDemandeSubvention,
      membreId: uidBeneficiaireSubvention1,
    })
    const uidBeneficiaireSubvention2 = `commune-35347${uidAction}-93`
    await creerMembre(uidBeneficiaireSubvention2)
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: uidDemandeSubvention,
      membreId: uidBeneficiaireSubvention2,
    })
  }

  const uidCoFinancement = `commune-113${uidAction}-93`
  await creerMembre(uidCoFinancement)
  await creerUnCoFinancement({ actionId: uidAction, memberId: uidCoFinancement, montant: 15_000 })
}

async function creerMembre(uid: string, nom = 'Métropole de Lyon'): Promise<void> {
  await creerUnContact({ email: `${uid}@example.com` })
  await creerUnMembre({
    contact: `${uid}@example.com`,
    gouvernanceDepartementCode: codeDepartement,
    id: uid,
  })
  await creerUnMembreEpci({
    epci: nom,
    membreId: uid,
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
