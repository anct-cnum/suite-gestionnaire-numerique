import { Utilisateur } from '@/domain/Utilisateur'

export interface FindUtilisateurRepository {
  find: (uid: string) => Promise<Utilisateur | null>
}

export interface DropUtilisateurRepository extends FindUtilisateurRepository{
  drop: (utilisateur: Utilisateur) => Promise<boolean>
}

export interface UpdateUtilisateurRepository {
  update: (utilisateur: Utilisateur) => Promise<void>
}

export interface AddUtilisateurRepository extends FindUtilisateurRepository{
  add: (utilisateur: Utilisateur) => Promise<boolean>
}

export interface UtilisateurRepository
  extends FindUtilisateurRepository,
    DropUtilisateurRepository,
    AddUtilisateurRepository,
    UpdateUtilisateurRepository {}
