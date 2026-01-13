import { GouvernanceUid } from './Gouvernance'
import { Membre, MembreFailure, MembreUid, Role, Statut } from './Membre'
import { membreFactory } from './MembreFactory'
import { StructureUid } from './Structure'
import { MembreSupprimer } from '@/domain/MembreSupprimer'
import { Result } from '@/shared/lang'

export class MembreCandidat extends Membre {
  constructor(uid: MembreUid,
    nom: string,
    uidGouvernance: GouvernanceUid,
    statut: Statut,
    uidStructure: StructureUid) {
    super(uid, nom, [], uidGouvernance, statut, undefined, uidStructure)
  }

  confirmer(): Result<MembreFailure, Membre> {
    return membreFactory({
      nom: this.nom,
      roles: [],
      statut: 'confirme',
      uid: this.uid.state,
      uidGouvernance: this.uidGouvernance.state,
      uidStructure: this.uidStructure.state,
    })
  }

  override supprimer(date: Date): Membre {
    return new MembreSupprimer(
      this.uid,
      this.nom,
      this.state.roles.filter( role=> role !== 'coporteur').map(role => new Role(role)),
      this.uidGouvernance,
      new Statut('supprimer'),
      date,
      this.uidStructure
    )
  }
}
