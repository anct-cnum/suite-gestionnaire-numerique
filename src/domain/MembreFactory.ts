import { GouvernanceUid, GouvernanceUidState } from './Gouvernance'
import { Membre, MembreFailure, MembreState, MembreUid, Role, Statut } from './Membre'
import { MembreConfirme } from './MembreConfirme'
import { MembrePotentiel } from './MembrePotentiel'
import { Result } from '@/shared/lang'

export function membreFactory({
  nom,
  roles,
  statut,
  uid,
  uidGouvernance,
}: FactoryParams): Result<MembreFailure, Membre> {
  if (roles) {
    return new MembreConfirme(
      new MembreUid(uid.value),
      nom,
      roles.map((role) => new Role(role)),
      new Statut(statut),
      new GouvernanceUid(uidGouvernance.value)
    )
  }

  return new MembrePotentiel(
    new MembreUid(uid.value),
    nom,
    new GouvernanceUid(uidGouvernance.value),
    new Statut(statut)
  )
}

type FactoryParams = Readonly<{
  nom: string
  roles?: ReadonlyArray<string>
  statut: string
  uid: MembreState['uid']
  uidGouvernance: GouvernanceUidState
}>
