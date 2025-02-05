import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'

export interface GetGouvernanceRepository {
  get(uid: GouvernanceUid): Promise<Gouvernance>
}

export interface UpdateGouvernanceRepository {
  update(gouvernance: Gouvernance): Promise<void>
}
