import { Model } from './shared/Model'

export class Role implements Model {
  readonly #territoireOuStructure: string
  readonly #nom: TypologieRole

  constructor(nom: TypologieRole, territoireOuStructure = '') {
    this.#territoireOuStructure = territoireOuStructure
    this.#nom = nom
  }

  state(): RoleState {
    return {
      categorie: categorieByType[this.#nom],
      nom: this.#nom,
      territoireOuStructure: this.#territoireOuStructure,
    }
  }
}

export type RoleState = Readonly<{
  categorie: Categorie
  nom: TypologieRole
  territoireOuStructure: string
}>

export const Roles = [
  'Administrateur dispositif',
  'Gestionnaire département',
  'Gestionnaire groupement',
  'Gestionnaire région',
  'Gestionnaire structure',
  'Instructeur',
  'Pilote politique publique',
  'Support animation',
] as const

export type TypologieRole = typeof Roles[number]

export type Categorie = 'anct' | 'bdt' | 'groupement' | 'maille' | 'mednum' | 'structure'

export const categorieByType: Readonly<Record<TypologieRole, Categorie>> = {
  'Administrateur dispositif': 'anct',
  'Gestionnaire département': 'maille',
  'Gestionnaire groupement': 'groupement',
  'Gestionnaire région': 'maille',
  'Gestionnaire structure': 'structure',
  Instructeur: 'bdt',
  'Pilote politique publique': 'anct',
  'Support animation': 'mednum',
}
