import { Comite } from '@/domain/Comite'

export interface AddComiteRepository {
  add(comite: Comite): Promise<void>
}
