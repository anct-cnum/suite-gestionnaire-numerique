import { Membre, MembreState } from '@/domain/Membre'

export interface GetMembreRepository {
  get(uid: MembreState['uid']['value']): Promise<Membre>
}

export interface UpdateMembreRepository {
  update(membre: Membre): Promise<void>
}

export interface GetMembresDuGestionnaireRepository {
  getMembres(uidGestionnaire: string): Promise<ReadonlyArray<Membre>>
}

export interface MembreRepository
  extends GetMembreRepository,
  UpdateMembreRepository,
  GetMembresDuGestionnaireRepository {}
