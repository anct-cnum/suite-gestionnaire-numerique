import { Model } from './shared/Model'

export class Role extends Model<RoleState> {
  readonly #nom: TypologieRole
  readonly #groupe: Groupe
  readonly #categorie: Categorie
  readonly #organisation: string

  constructor(nom: TypologieRole, territoireOuStructure = '') {
    super()
    const { categorie, groupe, organisation } = classificationParType[nom]
    this.#nom = nom
    this.#groupe = groupe
    this.#categorie = categorie
    this.#organisation = organisation ?? territoireOuStructure
  }

  state(): RoleState {
    return {
      categorie: this.#categorie,
      groupe: this.#groupe,
      nom: this.#nom,
      organisation: this.#organisation,
    }
  }

  isAdmin(): boolean {
    return this.#groupe === 'admin'
  }
}

export type RoleState = Readonly<{
  categorie: Categorie
  groupe: Groupe
  nom: TypologieRole
  organisation: string
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

export type TypologieRole = (typeof Roles)[number]

type Categorie = 'anct' | 'bdt' | 'groupement' | 'maille' | 'mednum' | 'structure'

type Groupe = 'admin' | 'gestionnaire'

type Classification = Readonly<{
  categorie: Categorie
  groupe: Groupe
  organisation?: string
}>

type ClassificationParType = Readonly<Record<TypologieRole, Classification>>

const classificationParType: ClassificationParType = {
  'Administrateur dispositif': {
    categorie: 'anct',
    groupe: 'admin',
    // temporaire en attendant de comprendre ce qu'est un dispositif en tant qu'organisation
    organisation: 'Administrateur dispositif',
  },
  'Gestionnaire département': {
    categorie: 'maille',
    groupe: 'gestionnaire',
  },
  'Gestionnaire groupement': {
    categorie: 'groupement',
    groupe: 'gestionnaire',
  },
  'Gestionnaire région': {
    categorie: 'maille',
    groupe: 'gestionnaire',
  },
  'Gestionnaire structure': {
    categorie: 'structure',
    groupe: 'gestionnaire',
  },
  Instructeur: {
    categorie: 'bdt',
    groupe: 'admin',
    organisation: 'Banque des territoires',
  },
  'Pilote politique publique': {
    categorie: 'anct',
    groupe: 'admin',
    organisation: 'France Numérique Ensemble',
  },
  'Support animation': {
    categorie: 'mednum',
    groupe: 'admin',
    organisation: 'Mednum',
  },
}
