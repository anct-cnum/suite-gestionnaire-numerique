import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'

export interface FindGouvernanceRepository {
  find(uid: GouvernanceUid): Promise<Gouvernance | null>
}

export interface UpdateGouvernanceRepository {
  update(gouvernance: Gouvernance): Promise<void>
}
