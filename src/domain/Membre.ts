import { GouvernanceUid } from './Gouvernance'
import { Entity, Uid, ValueObject } from './shared/Model'
import { Result } from '@/shared/lang'

export abstract class Membre extends Entity<MembreState> {
  protected readonly nom: string
  protected readonly uidGouvernance: GouvernanceUid
  protected readonly statut: Statut

  constructor(
    uid: MembreUid,
    nom: string,
    uidGouvernance: GouvernanceUid,
    statut: Statut
  ) {
    super(uid)
    this.uidGouvernance = uidGouvernance
    this.nom = nom
    this.statut = statut
  }

  override get state(): MembreState {
    return {
      nom: this.nom,
      statut: this.statut.state.value,
      uid: this.uid.state,
      uidGouvernance: this.uidGouvernance.state.value,
    }
  }

  appartientALaGouvernance(uidGouvernance: string): boolean {
    return uidGouvernance === this.uidGouvernance.state.value
  }

  abstract confirmer(): Result<MembreFailure, Membre>
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
  nom: string
  roles?: ReadonlyArray<string>
  statut: string
  uid: UidState
  uidGouvernance: string
}>

export type MembreFailure = 'membreDejaConfirme'

type UidState = Readonly<{ value: string }>

type AttributState = Readonly<{ value: string }>
