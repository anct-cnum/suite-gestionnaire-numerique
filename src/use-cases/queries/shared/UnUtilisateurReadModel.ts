export type UnUtilisateurReadModel = Readonly<{
  departementCode: string | null
  derniereConnexion: Date
  email: string
  groupementId: number | null
  inviteLe: Date
  isActive: boolean
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: Readonly<{
    categorie: string
    groupe: string
    nom: string
    territoireOuStructure: string
  }>
  regionCode: string | null
  structureId: number | null
  telephone: string
  uid: string
}>
