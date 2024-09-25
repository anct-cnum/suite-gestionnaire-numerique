import { UtilisateurState } from '@/domain/Utilisateur'

export interface UnUtilisateurLoader {
  findBySsoId: (ssoId: string) => Promise<UnUtilisateurReadModel>
}

export type UnUtilisateurReadModel = UtilisateurState & Readonly<{
  departementCode: string | null
  derniereConnexion: Date
  groupementId: number | null
  inviteLe: Date
  isActive: boolean
  regionCode: string | null
  structureId: number | null
}>

export class UtilisateurNonTrouveError extends Error {
  constructor() {
    super('L’utilisateur n’existe pas.')
  }
}
