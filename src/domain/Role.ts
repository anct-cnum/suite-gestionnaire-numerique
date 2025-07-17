import { ValueObject } from './shared/Model'

export class Role extends ValueObject<RoleState> {
  constructor(nom: TypologieRole, territoireOuStructure = '') {
    const { categorie, groupe, organisation } = classificationParType[nom]
    super({
      categorie,
      groupe,
      nom,
      organisation: organisation ?? territoireOuStructure,
      rolesGerables: isAdmin(groupe) ? Roles : [nom],
    })
  }
}

export type RoleState = Readonly<{
  categorie: Categorie
  groupe: Groupe
  nom: TypologieRole
  organisation: string
  rolesGerables: ReadonlyArray<TypologieRole>
}>

export const Roles = [
  'Administrateur dispositif',
  'Gestionnaire département',
  'Gestionnaire groupement',
  'Gestionnaire région',
  'Gestionnaire structure',
] as const

export type TypologieRole = (typeof Roles)[number]

export function isGestionnaireDepartement(nom: TypologieRole): boolean {
  return nom === 'Gestionnaire département'
}

function isAdmin(groupe: string): boolean {
  return groupe === 'admin'
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
}
