import { Model } from './shared/Model'

export class Role implements Model {
  readonly #nom: TypologieRole
  readonly #territoireOuStructure: string

  constructor(nom: TypologieRole, territoireOuStructure = '') {
    this.#nom = nom
    this.#territoireOuStructure = territoireOuStructure
  }

  state(): RoleState {
    return {
      categorie: categorieByType[this.#nom],
      groupe: groupe[this.#nom],
      nom: this.#nom,
      territoireOuStructure: this.#territoireOuStructure,
    }
  }
}

export type RoleState = Readonly<{
  categorie: Categorie
  groupe: Groupe
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

const groupe: Readonly<Record<TypologieRole, Groupe>> = {
  'Administrateur dispositif': 'admin',
  'Gestionnaire département': 'gestionnaire',
  'Gestionnaire groupement': 'gestionnaire',
  'Gestionnaire région': 'gestionnaire',
  'Gestionnaire structure': 'gestionnaire',
  Instructeur: 'admin',
  'Pilote politique publique': 'admin',
  'Support animation': 'admin',
}

export type Groupe = 'admin' | 'gestionnaire'
