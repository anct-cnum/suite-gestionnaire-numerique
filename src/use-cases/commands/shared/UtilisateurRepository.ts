import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

export interface FindUtilisateurRepository {
  find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null>
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
  FindUtilisateurRepository,
  DropUtilisateurRepository,
  AddUtilisateurRepository,
  UpdateUtilisateurRepository {}
