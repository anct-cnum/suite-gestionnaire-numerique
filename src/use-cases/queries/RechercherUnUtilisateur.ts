import { UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'

export interface UnUtilisateurLoader {
  findByUid: (uid: string) => Promise<UnUtilisateurReadModel>
}

export class UtilisateurNonTrouveError extends Error {
  constructor() {
    super('L’utilisateur n’existe pas.')
  }
}
