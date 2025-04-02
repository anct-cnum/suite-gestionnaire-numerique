import { QueryHandler } from '../QueryHandler'
import { sum } from '@/shared/lang'

export class RecupererLesFeuillesDeRoute implements QueryHandler<Query, FeuillesDeRouteReadModel> {
  readonly #loader: FeuillesDeRouteLoader

  constructor(loader: FeuillesDeRouteLoader) {
    this.#loader = loader
  }

  async handle(query: Query): Promise<FeuillesDeRouteReadModel> {
    const rawReadModel = await this.#loader.feuillesDeRoute(query.codeDepartement)
    const readModelInitial: FeuillesDeRouteReadModel = { ...rawReadModel, feuillesDeRoute: [] }
    return rawReadModel.feuillesDeRoute.reduce((readModel, feuilleDeRoute) => {
      const recapitulatifActions = feuilleDeRoute.actions.reduce((recapActions, action) => {
        const coFinancement = calculerCoFinancements(action)
        const financementAccorde = calculerFinancementAccorde(action)
        return {
          actions: recapActions.actions.concat({ ...action, totaux: { coFinancement, financementAccorde } }),
          ensembleBeneficiaires: ajouterBeneficiaires(action, recapActions.ensembleBeneficiaires),
          ensembleCoFinanceurs: ajouterCoFinanceurs(action, recapActions.ensembleCoFinanceurs),
          totaux: {
            budget: recapActions.totaux.budget + action.budgetGlobal,
            coFinancement: recapActions.totaux.coFinancement + coFinancement,
            financementAccorde: recapActions.totaux.financementAccorde + financementAccorde,
          },
        }
      }, recapitulatifInitialActions)
      const feuilleDeRouteCalculee = recapFeuilleDeRoute(feuilleDeRoute, recapitulatifActions)
      return {
        ...readModel,
        feuillesDeRoute: readModel.feuillesDeRoute.concat(feuilleDeRouteCalculee),
        totaux: {
          budget: readModel.totaux.budget + feuilleDeRouteCalculee.totaux.budget,
          coFinancement: readModel.totaux.coFinancement + feuilleDeRouteCalculee.totaux.coFinancement,
          financementAccorde: readModel.totaux.financementAccorde
              + feuilleDeRouteCalculee.totaux.financementAccorde,
        },
      }
    }, readModelInitial)
  }
}

export interface FeuillesDeRouteLoader {
  feuillesDeRoute(codeDepartement: string): Promise<FeuillesDeRouteReadModel>
}

export type FeuillesDeRouteReadModel = Readonly<{
  feuillesDeRoute: ReadonlyArray<FeuilleDeRouteReadModel>
  porteursPotentielsNouvellesFeuillesDeRouteOuActions: ReadonlyArray<MembreAvecRoleDansLaGouvernance>
  totaux: Readonly<{
    budget: number
    coFinancement: number
    financementAccorde: number
  }>
  uidGouvernance: string
}>

export type StatutSubvention = 'acceptee' | 'deposee' | 'enCours' | 'refusee'

type RecapAction = Pick<
  FeuilleDeRouteReadModel, 'actions' | 'totaux'> & Readonly<{
    ensembleBeneficiaires: Set<string>
    ensembleCoFinanceurs: Set<string>
  }>

const recapitulatifInitialActions: RecapAction = {
  actions: [],
  ensembleBeneficiaires: new Set<string>(),
  ensembleCoFinanceurs: new Set<string>(),
  totaux: {
    budget: 0,
    coFinancement: 0,
    financementAccorde: 0,
  },
}

function calculerCoFinancements(action: ActionReadModel): number {
  return action.coFinancements.map(({ montant }) => montant).reduce(sum, 0)
}

function calculerFinancementAccorde(action: ActionReadModel): number {
  return action.subvention?.statut === 'acceptee'
    ? action.subvention.montants.prestation + action.subvention.montants.ressourcesHumaines
    : 0
}

function ajouterBeneficiaires(action: ActionReadModel, beneficiaires: Set<string>): Set<string> {
  return new Set(action.beneficiaires.map(({ uid }) => uid).concat([...beneficiaires]))
}

function ajouterCoFinanceurs(action: ActionReadModel, cofinanceurs: Set<string>): Set<string> {
  return new Set(
    action.coFinancements
      .map(({ coFinanceur: { uid } }) => uid)
      .concat([...cofinanceurs])
  )
}

function recapFeuilleDeRoute(
  feuilleDeRoute: FeuilleDeRouteReadModel,
  recapActions: RecapAction
): FeuilleDeRouteReadModel {
  return {
    ...feuilleDeRoute,
    actions: recapActions.actions,
    beneficiaires: recapActions.ensembleBeneficiaires.size,
    coFinanceurs: recapActions.ensembleCoFinanceurs.size,
    totaux: recapActions.totaux,
  }
}

type FeuilleDeRouteReadModel = Readonly<
  {
    actions: ReadonlyArray<ActionReadModel>
    beneficiaires: number
    coFinanceurs: number
    nom: string
    pieceJointe?: Readonly<{
      apercu: string
      emplacement: string
      metadonnees?: Readonly<{
        format: string
        taille: string
        upload: Date
      }>
      nom: string
    }>
    structureCoPorteuse?: Membre
    totaux: Readonly<{
      budget: number
      coFinancement: number
      financementAccorde: number
    }>
    uid: string
  }>

type ActionReadModel = Readonly<
  {
    beneficiaires: ReadonlyArray<Membre>
    besoins: ReadonlyArray<string>
    budgetGlobal: number
    coFinancements: ReadonlyArray<Readonly<{
      coFinanceur: Membre
      montant: number
    }>>
    contexte: string
    description: string
    nom: string
    porteurs: ReadonlyArray<Membre>
    subvention?: Readonly<{
      enveloppe: string
      montants: Readonly<{
        prestation: number
        ressourcesHumaines: number
      }>
      statut: StatutSubvention
    }>
    totaux: Readonly<{
      coFinancement: number
      financementAccorde: number
    }>
    uid: string
  }>

type Query = Readonly<{
  codeDepartement: string
}>

type Membre = Readonly<{
  nom: string
  uid: string
}>

type MembreAvecRoleDansLaGouvernance = Membre & Readonly<{ roles: ReadonlyArray<string> }>
