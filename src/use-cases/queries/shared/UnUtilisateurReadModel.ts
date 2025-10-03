export type RoleUtilisateur = 
  | 'administrateur_dispositif'
  | 'gestionnaire_departement'
  | 'gestionnaire_groupement'
  | 'gestionnaire_region'
  | 'gestionnaire_structure'

export type UnUtilisateurReadModel = Readonly<{
  departementCode: null | string
  derniereConnexion: Date
  displayMenusPilotage: boolean
  email: string
  groupementId: null | number
  inviteLe: Date
  isActive: boolean
  isGestionnaireDepartement: boolean
  isSuperAdmin: boolean
  nom: string
  prenom: string
  regionCode: null | string
  role: Readonly<{
    categorie: string
    doesItBelongToGroupeAdmin: boolean
    nom: string
    organisation: string
    rolesGerables: ReadonlyArray<string>
    type: RoleUtilisateur
  }>
  structureId: null | number
  telephone: string
  uid: string
}>
