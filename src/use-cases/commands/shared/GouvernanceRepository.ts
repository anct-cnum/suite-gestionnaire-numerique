import { Maybe } from 'purify-ts'

import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'

export interface FindGouvernanceRepository {
  find(uid: GouvernanceUid): Promise<Maybe<Gouvernance>>
}

export interface UpdateGouvernanceRepository {
  update(gouvernance: Gouvernance): Promise<void>
}
