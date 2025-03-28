import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

export interface GetUtilisateurRepository {
  get(uid: UtilisateurUidState['value']): Promise<Utilisateur>
}

export interface DropUtilisateurRepository {
  drop(utilisateur: Utilisateur): Promise<boolean>
}

export interface UpdateUtilisateurRepository {
  update(utilisateur: Utilisateur): Promise<void>
}

export interface UpdateUtilisateurUidRepository {
  updateUid(utilisateur: Utilisateur): Promise<void>
}

export interface AddUtilisateurRepository {
  add(utilisateur: Utilisateur): Promise<boolean>
}

export interface UtilisateurRepository extends
  AddUtilisateurRepository,
  DropUtilisateurRepository,
  GetUtilisateurRepository,
  UpdateUtilisateurRepository {}
