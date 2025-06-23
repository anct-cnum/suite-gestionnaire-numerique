import { PrismaLesFeuillesDeRouteLoader } from './PrismaLesFeuillesDeRouteLoader'
import { creerMembres, creerUnBeneficiaireSubvention, creerUnCoFinancement, creerUnContact, creerUnDepartement, creerUneAction, creerUneDemandeDeSubvention, creerUneEnveloppeFinancement, creerUneFeuilleDeRoute, creerUneGouvernance, creerUneRegion, creerUnMembre, creerUnMembreStructure, creerUnPorteurAction, creerUnUtilisateur } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTime, epochTimeMinusTwoDays } from '@/shared/testHelper'
import { Gouvernance, SyntheseGouvernance } from '@/use-cases/services/shared/etablisseur-synthese-gouvernance'

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
      pieceJointe: 'feuille-de-route-fake.pdf',
      porteurId: 'epci-200072056-93',
    })
    await creerUneFeuilleDeRoute({
      creation: epochTime,
      gouvernanceDepartementCode: '75',
      id: 3,
      nom: 'fdr3' })
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
    await creerUneDemandeDeSubvention({
      actionId: 1,
      createurId: 1,
      enveloppeFinancementId: 1,
      id: 1 })
    await creerUneDemandeDeSubvention({
      actionId: 3,
      createurId: 1,
      enveloppeFinancementId: 1,
      id: 2,
      subventionEtp: 9_000,
      subventionPrestation: 0,
    })
    await creerUnPorteurAction({ actionId: 1, membreId: 'structure-79227291600034-93' })
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: 2,
      membreId: 'commune-110-93',
    })
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: 1,
      membreId: 'commune-110-93',
    })
    await creerUnCoFinancement({ actionId: 1, memberId: 'commune-94028-93', montant: 15_000 })
    await creerUnCoFinancement({ actionId: 3, memberId: 'structure-79227291600034-93', montant: 25_000 })

    // WHEN
    const feuillesDeRouteReadModel = await new PrismaLesFeuillesDeRouteLoader(dummyEtablisseurSyntheseGouvernance).get('93')

    // THEN
    expect(feuillesDeRouteReadModel.feuillesDeRoute[0].nom).to.equal('Feuille de route 2')
    expect(feuillesDeRouteReadModel.feuillesDeRoute[1].nom).to.equal('Feuille de route 1')
  })
})

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
        uid: action.uid,
      })),
      beneficiaires: 0,
      budget: 0,
      coFinancement: 0,
      coFinanceurs: 0,
      financementAccorde: 0,
      financementDemande: 0,
      uid: feuilleDeRoute.uid,
    })),
    financementAccorde: 0,
    financementDemande: 0,
  }
}
