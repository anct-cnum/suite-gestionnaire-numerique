import { GouvernanceUid } from './Gouvernance'
import { Membre, MembreFailure, MembreState, MembreUid, Role, Statut } from './Membre'
import { Result } from '@/shared/lang'

export class MembreConfirme extends Membre {
  readonly #roles: ReadonlyArray<Role>

  constructor(
    uid: MembreUid,
    nom: string,
    roles: ReadonlyArray<Role>,
    statut: Statut,
    uidGouvernance: GouvernanceUid
  ) {
    super(
      uid,
      nom,
      uidGouvernance,
      statut
    )
    this.#roles = roles
  }

  override get state(): State {
    return {
      ...super.state,
      roles: this.#roles.map((role) => role.state.value),
    }
  }

  override confirmer(): Result<MembreFailure, Membre> {
    return 'membreDejaConfirme'
  }
}

type State = MembreState & Readonly<{
  roles: ReadonlyArray<string>
}>
