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
  if (statut === 'confirme') {
    return new MembreConfirme(
      new MembreUid(uid.value),
      nom,
      roles.map((role) => new Role(role)),
      new GouvernanceUid(uidGouvernance.value),
      new Statut(statut)
    )
  }

  return new MembrePotentiel(
    new MembreUid(uid.value),
    nom,
    new GouvernanceUid(uidGouvernance.value),
    new Statut(statut)
  )
}

export type StatutFactory = 'candidat' | 'confirme'

type FactoryParams = Readonly<{
  nom: string
  roles: ReadonlyArray<string>
  statut: StatutFactory
  uid: MembreState['uid']
  uidGouvernance: GouvernanceUidState
}>
