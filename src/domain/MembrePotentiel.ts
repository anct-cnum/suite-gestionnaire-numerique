import { Membre, MembreFailure } from './Membre'
import { membreFactory } from './MembreFactory'
import { Result } from '@/shared/lang'

export class MembrePotentiel extends Membre {
  confirmer(): Result<MembreFailure, Membre> {
    return membreFactory({
      nom: this.nom,
      roles: ['observateur'],
      statut: 'confirme',
      uid: this.uid.state,
      uidGouvernance: this.uidGouvernance.state,
    })
  }
}
