import { Comite } from '@/domain/Comite'

export interface FindComiteRepository {
  find(uid: Comite['uid']['state']['value']): Promise<Comite | null>
}

export interface AddComiteRepository {
  add(comite: Comite): Promise<boolean>
}

export interface UpdateComiteRepository {
  update(comite: Comite): Promise<void>
}
