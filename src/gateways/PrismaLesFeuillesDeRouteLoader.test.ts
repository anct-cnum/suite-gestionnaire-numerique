import { PrismaLesFeuillesDeRouteLoader } from './PrismaLesFeuillesDeRouteLoader'
import { creerUnBeneficiaireSubvention, creerUnCoFinancement, creerUnContactMembreGouvernance, creerUnDepartement, creerUneAction, creerUneDemandeDeSubvention, creerUneEnveloppeFinancement, creerUneFeuilleDeRoute, creerUneGouvernance, creerUneRegion, creerUnMembre, creerUnPorteurAction, creerUnUtilisateur } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTime, epochTimeMinusTwoDays } from '@/shared/testHelper'
import { FeuillesDeRouteReadModel } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

describe('récupérer les feuilles de route loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand une liste de feuilles de route est demandée par son code département existant, alors elle est renvoyée triée par ordre de création décroissant', async () => {
    // GIVEN
    await creerUneRegion()
    await creerUnDepartement({ code: '93', nom: 'Seine-Saint-Denis' })
    await creerUnDepartement({ code: '75' })
    await creerUneGouvernance({ departementCode: '93' })
    await creerUneGouvernance({ departementCode: '75' })
    await creerUnUtilisateur({ id: 1 })
    await creerUneFeuilleDeRoute({ creation: epochTimeMinusTwoDays, gouvernanceDepartementCode: '93', id: 1, nom: 'Feuille de route 1' })
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
    await creerUnContactMembreGouvernance({
      email: 'contact@example.com',
      fonction: 'Directeur',
      nom: 'Dupont',
      prenom: 'Jean',
    })
    await creerUnContactMembreGouvernance({
      email: 'structure@example.com',
      fonction: 'Directeur',
      nom: 'CC des Monts du Lyonnais',
      prenom: 'Jean',
    })
    await creerUnMembre({
      contact: 'structure@example.com',
      gouvernanceDepartementCode: '93',
      id: 'structureCoPorteuseFooId',
      statut: 'actif',
    })

    await prisma.feuilleDeRouteRecord.update({
      data: { porteurId: 'structureCoPorteuseFooId' },
      where: { id: 1 },
    })

    await prisma.feuilleDeRouteRecord.update({
      data: { porteurId: 'structureCoPorteuseFooId' },
      where: { id: 2 },
    })
    await creerUnMembre({
      contact: 'contact@example.com',
      gouvernanceDepartementCode: '93',
      id: 'membre1',
      statut: 'actif',
    })
    await creerUnPorteurAction({ actionId: 1, membreId: 'membre1' })
    await creerUnBeneficiaireSubvention({
      demandeDeSubventionId: 1,
      membreId: 'membre1',
    })
    await creerUnCoFinancement({ actionId: 1, memberId: 'membre1', montant: 15_000 })
    await creerUnCoFinancement({ actionId: 3, memberId: 'membre1', montant: 25_000 })

    // WHEN
    const feuillesDeRouteReadModel = await new PrismaLesFeuillesDeRouteLoader().feuillesDeRoute('93')

    // THEN
    expect(feuillesDeRouteReadModel.feuillesDeRoute).toHaveLength(2)

    const feuilleDeRoute1 = feuillesDeRouteReadModel.feuillesDeRoute[0]
    expect(feuilleDeRoute1.uid).toBe('2')
    expect(feuilleDeRoute1.nom).toBe('Feuille de route 2')
    expect(feuilleDeRoute1.beneficiaires).toBe(0)
    expect(feuilleDeRoute1.coFinanceurs).toBe(0)
    expect(feuilleDeRoute1.pieceJointe).toBeUndefined()
    expect(feuilleDeRoute1.structureCoPorteuse).toStrictEqual({
      nom: 'CC des Monts du Lyonnais',
      uid: 'structureCoPorteuseFooId',
    })
    expect(feuilleDeRoute1.totaux).toStrictEqual<FeuillesDeRouteReadModel['feuillesDeRoute'][number]['totaux']>({
      budget: 0,
      coFinancement: 0,
      financementAccorde: 0,
    })

    expect(feuilleDeRoute1.actions).toHaveLength(2)
    const action1Fdr1 = feuilleDeRoute1.actions[0]
    expect(action1Fdr1).toStrictEqual({
      beneficiaireUids: [],
      besoins:['Établir un diagnostic territorial'],
      budgetGlobal: 70_000,
      coFinancements: [{
        coFinanceurUid: 'membre1',
        montant: 25000,
      }],
      contexte: "Contexte de l'action",
      description: "Description détaillée de l'action",
      nom: 'Structurer une filière de reconditionnement locale 3',
      porteurs: [],
      subvention: undefined,
      totaux: {
        coFinancement: 0,
        financementAccorde: 0,
      },
      uid: '3',
    })
    const action2Fdr1 = feuilleDeRoute1.actions[1]
    expect(action2Fdr1).toStrictEqual({
      beneficiaireUids: [],
      besoins:['Établir un diagnostic territorial'],
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
    })

    const feuilleDeRoute2 = feuillesDeRouteReadModel.feuillesDeRoute[1]
    expect(feuilleDeRoute2.uid).toBe('1')
    expect(feuilleDeRoute2.nom).toBe('Feuille de route 1')
    expect(feuilleDeRoute2.beneficiaires).toBe(0)
    expect(feuilleDeRoute2.coFinanceurs).toBe(0)
    expect(feuilleDeRoute2.pieceJointe).toBeUndefined()
    expect(feuilleDeRoute2.structureCoPorteuse).toStrictEqual({
      nom: 'CC des Monts du Lyonnais',
      uid: 'structureCoPorteuseFooId',
    })
    expect(feuilleDeRoute2.totaux).toStrictEqual<FeuillesDeRouteReadModel['feuillesDeRoute'][number]['totaux']>({
      budget: 0,
      coFinancement: 0,
      financementAccorde: 0,
    })
    expect(feuilleDeRoute2.actions).toHaveLength(1)
    const action1Fdr2 = feuilleDeRoute2.actions[0]
    expect(action1Fdr2).toStrictEqual({
      beneficiaireUids: ['membre1'],
      besoins:['Établir un diagnostic territorial'],
      budgetGlobal: 70_000,
      coFinancements: [{
        coFinanceurUid: 'membre1',
        montant: 15_000,
      }],
      contexte: "Contexte de l'action",
      description: "Description détaillée de l'action",
      nom: 'Structurer une filière de reconditionnement locale 1',
      porteurs: [],
      subvention: {
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
    })
  })
})
