export type UnUtilisateurReadModel = Readonly<{
  departementCode: string | null
  derniereConnexion: Date
  email: string
  groupementId: number | null
  inviteLe: Date
  isActive: boolean
  isGestionnaireDepartement: boolean
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: Readonly<{
    categorie: string
    doesItBelongToGroupeAdmin: boolean
    nom: string
    organisation: string
    rolesGerables: ReadonlyArray<string>
  }>
  regionCode: string | null
  structureId: number | null
  telephone: string
  uid: string
}>
