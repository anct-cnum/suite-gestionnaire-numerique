import { UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'

export interface UnUtilisateurLoader {
  findBySsoId: (ssoId: string) => Promise<UnUtilisateurReadModel>
}

export class UtilisateurNonTrouveError extends Error {
  constructor() {
    super('L’utilisateur n’existe pas.')
  }
}
