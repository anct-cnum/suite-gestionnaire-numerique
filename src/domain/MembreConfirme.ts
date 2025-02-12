import { Membre, MembreFailure } from './Membre'
import { Result } from '@/shared/lang'

export class MembreConfirme extends Membre {
  override confirmer(): Result<MembreFailure, Membre> {
    return 'membreDejaConfirme'
  }
}
