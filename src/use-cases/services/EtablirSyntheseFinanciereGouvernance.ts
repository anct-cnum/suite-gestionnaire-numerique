import { StatutSubvention } from '../queries/RecupererLesFeuillesDeRoute'

export function etablirSyntheseFinanciereGouvernance(gouvernance: Gouvernance): SyntheseGouvernance {
  const bilanGouvernance = gouvernance.feuillesDeRoute.reduce(
    makeBilanGouvernance(({ actions, uid }) =>
      actions
        .map(makeBilanAction)
        .reduce(makeBilanFeuilleDeRoute(uid), bilanInitialFeuilleDeRoute)),
    bilanInitialGouvernance
  )
  return toSynthese(bilanGouvernance)
}

function toSynthese(bilan: BilanGouvernance): SyntheseGouvernance {
  return {
    ...bilan,
    beneficiaires: bilan.beneficiaires.size,
    coFinanceurs: bilan.coFinanceurs.size,
    feuillesDeRoute: bilan.feuillesDeRoute.map(feuilleDeRoute => ({
      ...feuilleDeRoute,
      actions: feuilleDeRoute.actions.map(({ budget, coFinancement, financementAccorde, uid }) => (
        { budget, coFinancement, financementAccorde, uid }
      )),
      beneficiaires: feuilleDeRoute.beneficiaires.size,
      coFinanceurs: feuilleDeRoute.coFinanceurs.size,
    })),
  }
}

function makeBilanGouvernance(bilanFeuilleDeRouteFactory: BilanFeuilleDeRouteFactory) {
  return (bilanGouvernance: BilanGouvernance, feuilleDeRoute: FeuilleDeRoute): BilanGouvernance => {
    const bilanFeuilleDeRoute = bilanFeuilleDeRouteFactory(feuilleDeRoute)
    return {
      beneficiaires: bilanGouvernance.beneficiaires.union(bilanFeuilleDeRoute.beneficiaires),
      budget: bilanGouvernance.budget + bilanFeuilleDeRoute.budget,
      coFinancement: bilanGouvernance.coFinancement + bilanFeuilleDeRoute.coFinancement,
      coFinanceurs: bilanGouvernance.coFinanceurs.union(bilanFeuilleDeRoute.coFinanceurs),
      feuillesDeRoute: bilanGouvernance.feuillesDeRoute.concat({ ...bilanFeuilleDeRoute, uid: feuilleDeRoute.uid }),
      financementAccorde: bilanGouvernance.financementAccorde + bilanFeuilleDeRoute.financementAccorde,
    }
  }
}

function makeBilanFeuilleDeRoute(uid: string) {
  return (bilanFeuilleDeRoute: BilanFeuilleDeRoute, action: BilanAction): BilanFeuilleDeRoute => ({
    actions: bilanFeuilleDeRoute.actions.concat(action),
    beneficiaires: bilanFeuilleDeRoute.beneficiaires.union(action.beneficiaires),
    budget: bilanFeuilleDeRoute.budget + action.budget,
    coFinancement: bilanFeuilleDeRoute.coFinancement + action.coFinancement,
    coFinanceurs: bilanFeuilleDeRoute.coFinanceurs.union(action.coFinanceurs),
    financementAccorde: bilanFeuilleDeRoute.financementAccorde + action.financementAccorde,
    uid,
  })
}

function makeBilanAction(action: Action): BilanAction {
  const subvention = action.subvention
  const { coFinancement, coFinanceurs } = action.coFinancements
    .reduce(
      ({ coFinancement, coFinanceurs }, { coFinanceur: { uid }, montant }) => ({
        coFinancement: coFinancement + montant,
        coFinanceurs: new Set(coFinanceurs).add(uid),
      }),
      {
        coFinancement: 0,
        coFinanceurs: new Set<string>(),
      }
    )
  return {
    beneficiaires: new Set(action.beneficiaires.map(({ uid }) => uid)),
    budget: action.budgetGlobal,
    coFinancement,
    coFinanceurs,
    financementAccorde: subvention?.statut === 'acceptee' ?
      subvention.montants.prestation + subvention.montants.ressourcesHumaines
      : 0,
    uid: action.uid,
  }
}

const bilanInitialGouvernance: BilanGouvernance = {
  beneficiaires: new Set(),
  budget: 0,
  coFinancement: 0,
  coFinanceurs: new Set(),
  feuillesDeRoute: [],
  financementAccorde: 0,
}

const bilanInitialFeuilleDeRoute: BilanFeuilleDeRoute = {
  actions: [],
  beneficiaires: new Set(),
  budget: 0,
  coFinancement: 0,
  coFinanceurs: new Set(),
  financementAccorde: 0,
  uid: '',
}

type Gouvernance = Readonly<{
  feuillesDeRoute: ReadonlyArray<FeuilleDeRoute>
}>

type FeuilleDeRoute = Readonly<{
  actions: ReadonlyArray<Action>
  uid: string
}>

type Action = Readonly<{
  beneficiaires: ReadonlyArray<Unique>
  budgetGlobal: Montant
  coFinancements: ReadonlyArray<
    Readonly<{
      coFinanceur: Unique
      montant: Montant
    }>
  >
  subvention?: Readonly<{
    montants: Readonly<{
      prestation: Montant
      ressourcesHumaines: Montant
    }>
    statut: StatutSubvention
  }>
  uid: string
}>

type SyntheseGouvernance = Readonly<{
  feuillesDeRoute: ReadonlyArray<SyntheseFeuilleDeRoute>
}> & Synthese

type SyntheseFeuilleDeRoute = Readonly<{
  actions: ReadonlyArray<FinancesAction>
}> & Synthese & Unique

type FinancesAction = Finances & Unique

type BilanGouvernance = Bilan & Readonly<{
  feuillesDeRoute: ReadonlyArray<BilanFeuilleDeRoute>
}>

type BilanFeuilleDeRoute = Bilan & Readonly<{
  actions: ReadonlyArray<BilanAction>
}> & Unique

type BilanAction = Bilan & Unique

type Finances = Readonly<{
  budget: Montant
  coFinancement: Montant
  financementAccorde: Montant
}>

type Synthese = Finances & Readonly<{
  beneficiaires: Denombrement
  coFinanceurs: Denombrement
}>

type Bilan = Finances & Readonly<{
  beneficiaires: ReadonlySet<string>
  coFinanceurs: ReadonlySet<string>
}>

type Unique = Readonly<{ uid: string }>

type BilanFeuilleDeRouteFactory = (feuilleDeRoute: FeuilleDeRoute) => BilanFeuilleDeRoute

// eslint-disable-next-line sonarjs/redundant-type-aliases
type Denombrement = number

// eslint-disable-next-line sonarjs/redundant-type-aliases
type Montant = number
