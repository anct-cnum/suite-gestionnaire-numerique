import { GouvernanceUid } from './Gouvernance'
import { Membre, MembreFailure, MembreUid, Role, Statut } from './Membre'
import { membreFactory } from './MembreFactory'
import { Result } from '@/shared/lang'

export class MembrePotentiel extends Membre {
  constructor(
    uid: MembreUid,
    nom: string,
    uidGouvernance: GouvernanceUid,
    statut: Statut
  ) {
    super(
      uid,
      nom,
      [new Role('observateur')],
      uidGouvernance,
      statut
    )
  }

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
