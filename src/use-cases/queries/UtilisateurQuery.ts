import { UtilisateurState } from '@/domain/Utilisateur'

export interface UtilisateurQuery {
  count: () => Promise<number>
  findAll: (pageCourante: number, utilisateursParPage: number) => Promise<Array<UtilisateurReadModel>>
  findBySsoId: (ssoId: string) => Promise<UtilisateurReadModel>
}

export type UtilisateurReadModel = UtilisateurState & Readonly<{
  derniereConnexion: Date
  inviteLe: Date
  isActive: boolean
  sub: string
}>

export class UtilisateurNonTrouveError extends Error {
  constructor() {
    super('L’utilisateur n’existe pas.')
  }
}
