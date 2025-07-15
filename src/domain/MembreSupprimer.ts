import { Membre, MembreFailure } from './Membre'
import { Result } from '@/shared/lang'

export class MembreSupprimer extends Membre {
  override confirmer(): Result<MembreFailure, Membre> {
    return 'membreSupprimer'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override supprimer(_date: Date): Membre {
    return this
  }
}
