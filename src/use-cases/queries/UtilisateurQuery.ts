import { UtilisateurState } from '@/domain/Utilisateur'

export interface UtilisateurQuery {
  findBySub: (sub: string) => Promise<UtilisateurReadModel>
}

export type UtilisateurReadModel = UtilisateurState

export class UtilisateurNonTrouveError extends Error {
  constructor() {
    super('L’utilisateur n’existe pas.')
  }
}
