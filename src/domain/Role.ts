import { Model } from './shared/Model'

export class Role extends Model<RoleState> {
  readonly #nom: TypologieRole
  readonly #organisation: string
  readonly #groupe: Groupe
  readonly #categorie: Categorie

  private constructor(nom: TypologieRole, organisation = '') {
    super()
    const classification = classificationParType[nom]
    this.#nom = nom
    this.#organisation = classification.organisation ?? organisation
    this.#groupe = classification.groupe
    this.#categorie = classification.categorie
  }

  static create(nom: TypologieRole, organisation = ''): Role {
    return new Role(nom, organisation)
  }

  static fromOrganisations(nom: TypologieRole, organisations: Organisations): Role {
    const territoireOuStructure = typologieTerritoireOuStructureParRole[nom]
    return new Role(nom, territoireOuStructure ? organisations[territoireOuStructure] : '')
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

export type Organisations = Readonly<Partial<Record<TypologieTerriroireOuStructure, string>>>

type TypologieTerriroireOuStructure = 'departement' | 'region' | 'structure' | 'groupement'

const typologieTerritoireOuStructureParRole: Readonly<
  Partial<Record<TypologieRole, TypologieTerriroireOuStructure>>
> = {
  'Gestionnaire département': 'departement',
  'Gestionnaire groupement': 'groupement',
  'Gestionnaire région': 'region',
  'Gestionnaire structure': 'structure',
}

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
