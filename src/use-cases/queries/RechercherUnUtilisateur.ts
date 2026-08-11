import { UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'

export interface UnUtilisateurLoader {
  findById(id: number): Promise<UnUtilisateurReadModel>
}
