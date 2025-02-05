import { Comite } from '@/domain/Comite'

export interface GetComiteRepository {
  get(uid: Comite['uid']['state']['value']): Promise<Comite>
}

export interface AddComiteRepository {
  add(comite: Comite): Promise<boolean>
}

export interface UpdateComiteRepository {
  update(comite: Comite): Promise<void>
}

export interface DropComiteRepository {
  drop(comite: Comite): Promise<void>
}

export interface ComiteRepository extends
  GetComiteRepository,
  DropComiteRepository,
  AddComiteRepository,
  UpdateComiteRepository {}
