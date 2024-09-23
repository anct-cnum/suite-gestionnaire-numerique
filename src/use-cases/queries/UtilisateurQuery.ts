import { UtilisateurState } from '@/domain/Utilisateur'

export interface UtilisateurQuery {
  findMesUtilisateursEtLeTotal: (
    ssoId: string,
    pageCourante: number,
    utilisateursParPage: number
  ) => Promise<UtilisateursCourantsEtTotalReadModel>
  findBySsoId: (ssoId: string) => Promise<UtilisateurReadModel>
}

export type UtilisateurReadModel = UtilisateurState & Readonly<{
  departementCode: string | null
  derniereConnexion: Date
  groupementId: number | null
  inviteLe: Date
  isActive: boolean
  regionCode: string | null
  structureId: number | null
}>

export type UtilisateursCourantsEtTotalReadModel = Readonly<{
  utilisateursCourants: ReadonlyArray<UtilisateurReadModel>
  total: number,
}>

export class UtilisateurNonTrouveError extends Error {
  constructor() {
    super('L’utilisateur n’existe pas.')
  }
}
