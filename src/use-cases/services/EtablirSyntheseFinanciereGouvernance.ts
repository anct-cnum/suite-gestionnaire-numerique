import { Finances, Gouvernance, SyntheseGouvernance } from './shared/etablisseur-synthese-gouvernance'

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
      actions: feuilleDeRoute.actions.map(action => ({
        ...action,
        beneficiaires: action.beneficiaires.size,
        coFinanceurs: action.coFinanceurs.size,
      })),
      beneficiaires: feuilleDeRoute.beneficiaires.size,
      coFinanceurs: feuilleDeRoute.coFinanceurs.size,
    })),
  }
}

function makeBilanGouvernance(bilanFeuilleDeRouteFactory: BilanFeuilleDeRouteFactory) {
  return (bilanGouvernance: BilanGouvernance, feuilleDeRoute: Gouvernance['feuillesDeRoute'][number]): BilanGouvernance => {
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

function makeBilanAction(action: Gouvernance['feuillesDeRoute'][number]['actions'][number]): BilanAction {
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

type BilanGouvernance = Bilan & Readonly<{
  feuillesDeRoute: ReadonlyArray<BilanFeuilleDeRoute>
}>

type BilanFeuilleDeRoute = Bilan & Readonly<{
  actions: ReadonlyArray<BilanAction>
}> & Unique

type BilanAction = Bilan & Unique

type Bilan = Finances & Readonly<{
  beneficiaires: ReadonlySet<string>
  coFinanceurs: ReadonlySet<string>
}>

type BilanFeuilleDeRouteFactory = (feuilleDeRoute: Gouvernance['feuillesDeRoute'][number]) => BilanFeuilleDeRoute

type Unique = Readonly<{ uid: string }>
