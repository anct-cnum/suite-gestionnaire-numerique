import { QueryHandler } from '../QueryHandler'
import { sum } from '@/shared/lang'

export class RecupererLesFeuillesDeRoute implements QueryHandler<Query, FeuillesDeRouteReadModel> {
  readonly #loader: FeuillesDeRouteLoader

  constructor(loader: FeuillesDeRouteLoader) {
    this.#loader = loader
  }

  async handle(query: Query): Promise<FeuillesDeRouteReadModel> {
    const readModel = await this.#loader.feuillesDeRoute(query.codeDepartement)
    const feuillesDeRoute = readModel.feuillesDeRoute.map(feuilleDeRoute => {
      const coFinancement = sommerCoFinancements(feuilleDeRoute.actions)
      const financementAccorde = sommerFinancementsAccordes(feuilleDeRoute.actions)
      return {
        ...feuilleDeRoute,
        beneficiaires: nombreDeBeneficiaires(feuilleDeRoute.actions),
        coFinanceurs: nombreDeCofinanceurs(feuilleDeRoute.actions),
        totaux: {
          ...feuilleDeRoute.totaux,
          budget: coFinancement + financementAccorde,
          coFinancement,
          financementAccorde,
        },
      }
    })
    const coFinancementGlobal = sommerFinancementGlobal(feuillesDeRoute, 'coFinancement')
    const financementAccordeGlobal = sommerFinancementGlobal(feuillesDeRoute, 'financementAccorde')
    const budgetGlobal = coFinancementGlobal + financementAccordeGlobal
    return {
      ...readModel,
      feuillesDeRoute,
      totaux: {
        budget: budgetGlobal,
        coFinancement: coFinancementGlobal,
        financementAccorde: financementAccordeGlobal,
      },
    }
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

export type StatutSubvention = 'deposee' | 'enCours' | 'acceptee' | 'refusee'

function sommerCoFinancements(actions: ReadonlyArray<ActionReadModel>): number {
  return actions
    .flatMap(({ coFinancements }) => coFinancements)
    .flatMap(({ montant }) => montant)
    .reduce(sum, 0)
}

function sommerFinancementsAccordes(actions: ReadonlyArray<ActionReadModel>): number {
  return actions
    .filter(action => action.subvention?.statut === 'acceptee')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map(({ subvention }) => subvention!.montants.prestation + subvention!.montants.ressourcesHumaines)
    .reduce(sum, 0)
}

function sommerFinancementGlobal(
  feuillesDeRoute: ReadonlyArray<FeuilleDeRouteReadModel>,
  total: keyof FeuilleDeRouteReadModel['totaux']
): number {
  return feuillesDeRoute
    .map(({ totaux }) => totaux[total])
    .reduce(sum, 0)
}

function nombreDeBeneficiaires(
  actions: ReadonlyArray<ActionReadModel>
): number {
  const beneficiaires = actions
    .flatMap(({ beneficiaires }) => beneficiaires)
    .flatMap(({ uid }) => uid)
  return new Set(beneficiaires).size
}

function nombreDeCofinanceurs(
  actions: ReadonlyArray<ActionReadModel>
): number {
  const cofinanceurs = actions
    .flatMap(({ coFinancements }) => coFinancements)
    .flatMap(({ coFinanceur }) => coFinanceur.uid)
  return new Set(cofinanceurs).size
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
      nom: string
      upload: Date
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
    nom: string
    porteurs: ReadonlyArray<Membre>
    coFinancements: ReadonlyArray<Readonly<{
      coFinanceur: Membre
      montant: number
    }>>
    beneficiaires: ReadonlyArray<Membre>
    contexte: string
    description: string
    besoins: ReadonlyArray<string>
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
    budgetGlobal: number
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
