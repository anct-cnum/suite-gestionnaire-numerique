import { QueryHandler } from '../QueryHandler'

export class RecupererLesFeuillesDeRoute implements QueryHandler<Query, FeuillesDeRouteReadModel> {
  readonly #loader: FeuillesDeRouteLoader

  constructor(loader: FeuillesDeRouteLoader) {
    this.#loader = loader
  }

  async handle(query: Query): Promise<FeuillesDeRouteReadModel> {
    return this.#loader.feuillesDeRoute(query.codeDepartement)
      .then(calculateTotauxActions)
      .then(calculateTotauxFeuillesDeRoute)
  }
}

export interface FeuillesDeRouteLoader {
  feuillesDeRoute(codeDepartement: string): Promise<FeuillesDeRouteReadModel>
}

export type FeuillesDeRouteReadModel = Readonly<{
  departement: string
  feuillesDeRoute: ReadonlyArray<{
    actions: ReadonlyArray<{
      nom: string
      porteur?: Readonly<{
        nom: string
        uid: string
      }>
      statut: 'deposee' | 'enCours' | 'subventionAcceptee' | 'subventionRefusee'
      totaux: Readonly<{
        coFinancement: number
        financementAccorde: number
      }>
      uid: string
    }>
    beneficiaires: number
    coFinanceurs: number
    nom: string
    pieceJointe?: Readonly<{
      apercu: string
      emplacement: string
      nom: string
      upload: Date
    }>
    structureCoPorteuse: Readonly<{
      nom: string
      uid: string
    }>
    totaux: Readonly<{
      budget: number
      coFinancement: number
      financementAccorde: number
    }>
    uid: string
  }>
  totaux: Readonly<{
    budget: number
    coFinancement: number
    financementAccorde: number
  }>
}>

type Query = Readonly<{
  codeDepartement: string
}>

function calculateTotauxActions(feuillesDeRoute: FeuillesDeRouteReadModel): FeuillesDeRouteReadModel {
  return {
    ...feuillesDeRoute,
    feuillesDeRoute: feuillesDeRoute.feuillesDeRoute.map((feuilleDeRoute) => {
      const { coFinancement, financementAccorde } = feuilleDeRoute.actions.reduce((budget, action) => ({
        coFinancement: budget.coFinancement + action.totaux.coFinancement,
        financementAccorde: budget.financementAccorde + (action.statut === 'subventionAcceptee' ? action.totaux.financementAccorde : 0),
      }), { coFinancement: 0, financementAccorde: 0 })

      return {
        ...feuilleDeRoute,
        totaux: {
          budget: coFinancement + financementAccorde,
          coFinancement,
          financementAccorde,
        },
      }
    }),
  }
}

function calculateTotauxFeuillesDeRoute(feuillesDeRoute: FeuillesDeRouteReadModel): FeuillesDeRouteReadModel {
  const { coFinancement, financementAccorde } = feuillesDeRoute.feuillesDeRoute.reduce((budget, feuilleDeRoute) => ({
    coFinancement: budget.coFinancement + feuilleDeRoute.totaux.coFinancement,
    financementAccorde: budget.financementAccorde + feuilleDeRoute.totaux.financementAccorde,
  }), { coFinancement: 0, financementAccorde: 0 })

  return {
    ...feuillesDeRoute,
    totaux: {
      budget: coFinancement + financementAccorde,
      coFinancement,
      financementAccorde,
    },
  }
}
