import { Membre, MembreFailure, MembreUid, Role, Statut } from './Membre'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { MembreSupprimer } from '@/domain/MembreSupprimer'
import { Result } from '@/shared/lang'

export class MembreConfirme extends Membre {
  constructor(
    uid: MembreUid,
    nom: string,
    roles: ReadonlyArray<Role>,
    uidGouvernance: GouvernanceUid,
    statut: Statut
  ) {
    super(uid, nom, roles, uidGouvernance, statut, undefined)
  }

  override confirmer(): Result<MembreFailure, Membre> {
    return 'membreDejaConfirme'
  }

  override supprimer(date: Date): Membre {
    return new MembreSupprimer(
      this.uid,
      this.nom,
      this.state.roles.filter( role=> role !== 'coporteur').map(role => new Role(role)),
      this.uidGouvernance,
      new Statut('supprimer'),
      date
    )
  }
}
