import { GouvernanceUid, GouvernanceUidState } from './Gouvernance'
import { Entity, Uid, ValueObject } from './shared/Model'
import { Result } from '@/shared/lang'

export abstract class Membre extends Entity<MembreState> {
  override get state(): MembreState {
    return {
      dateSuppression: this.dateSuppression,
      nom: this.nom,
      roles: this.roles.map((role) => role.state.value),
      statut: this.statut.state.value,
      uid: this.uid.state,
      uidGouvernance: this.uidGouvernance.state,
    }
  }

  protected readonly dateSuppression: Date | undefined
  protected readonly nom: string
  protected readonly roles: ReadonlyArray<Role>
  protected readonly statut: Statut
  protected readonly uidGouvernance: GouvernanceUid

  constructor(
    uid: MembreUid,
    nom: string,
    roles: ReadonlyArray<Role>,
    uidGouvernance: GouvernanceUid,
    statut: Statut,
    dateSuppression: Date | undefined
  ) {
    super(uid)
    this.uidGouvernance = uidGouvernance
    this.nom = nom
    this.roles = roles
    this.statut = statut
    this.dateSuppression = dateSuppression
  }

  appartientALaGouvernance(uidGouvernance: string): boolean {
    return uidGouvernance === this.uidGouvernance.state.value
  }

  abstract confirmer(): Result<MembreFailure, Membre>
  abstract supprimer(date: Date): Membre
}

export class MembreUid extends Uid<UidState> {
  constructor(value: string) {
    super({ value })
  }
}

export class Role extends ValueObject<AttributState> {
  constructor(value: string) {
    super({ value })
  }
}

export class Statut extends ValueObject<AttributState> {
  constructor(value: string) {
    super({ value })
  }
}

export type MembreState = Readonly<{
  dateSuppression: Date | undefined
  nom: string
  roles: ReadonlyArray<string>
  statut: string
  uid: UidState
  uidGouvernance: GouvernanceUidState
}>

export type MembreFailure = 'membreDejaConfirme' | 'membreSupprimer'

type UidState = Readonly<{ value: string }>

type AttributState = Readonly<{ value: string }>
