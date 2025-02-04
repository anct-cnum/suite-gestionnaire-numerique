import { UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'

export interface UnUtilisateurLoader {
  findByUid(uid: string): Promise<UnUtilisateurReadModel>
}
