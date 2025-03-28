export type UnUtilisateurReadModel = Readonly<{
  departementCode: null | string
  derniereConnexion: Date
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
  }>
  structureId: null | number
  telephone: string
  uid: string
}>
