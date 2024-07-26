import { Model } from './shared/Model'

export const ROLES = [
  'Administrateur dispositif',
  'Gestionnaire département',
  'Gestionnaire groupement',
  'Gestionnaire région',
  'Gestionnaire structure',
  'Instructeur',
  'Pilote politique publique',
  'Support animation',
] as const

export type TypologieRole = typeof ROLES[number]

export type Categorisation =
  'anct' | 'bdt' | 'groupement' | 'maille' | 'mednum' | 'structure'

export type RoleState = Required<PartialState>

export class Role implements Model {
  readonly #state: RoleState

  constructor(state: PartialState) {
    this.#state = {
      ...state,
      territoireOuStructure: state.territoireOuStructure ?? perimetreNonApplicable,
    }
  }

  state(): RoleState {
    return this.#state
  }

  categorie(): Categorisation {
    return categorieByType[this.#state.typologie]
  }
}

type PartialState = Readonly<{
  typologie: TypologieRole,
  territoireOuStructure?: string
}>

const perimetreNonApplicable = ''

const categorieByType: Readonly<Record<TypologieRole, Categorisation>> = {
  'Administrateur dispositif': 'anct',
  'Gestionnaire département': 'maille',
  'Gestionnaire groupement': 'groupement',
  'Gestionnaire région': 'maille',
  'Gestionnaire structure': 'structure',
  Instructeur: 'bdt',
  'Pilote politique publique': 'anct',
  'Support animation': 'mednum',
}
