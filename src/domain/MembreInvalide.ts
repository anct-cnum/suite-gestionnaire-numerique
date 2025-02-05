import { Membre, MembreFailure } from './Membre'
import { membreFactory } from './MembreFactory'
import { Result } from '@/shared/lang'

export class MembreInvalide extends Membre {
  valider(): Result<MembreFailure, Membre> {
    return membreFactory({
      nom: this.nom,
      roles: ['observateur'],
      statut: 'valide',
      uid: this.uid.state,
      uidGouvernance: this.uidGouvernance.state,
    })
  }
}
