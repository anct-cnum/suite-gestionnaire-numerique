import { Utilisateur, UtilisateurState } from './Utilisateur'

export class Administrateur extends Utilisateur {
  override get isAdmin(): boolean {
    return true
  }

  override get state(): AdministrateurState {
    return super.state
  }

  override peutGerer(): boolean {
    return true
  }
}

type AdministrateurState = UtilisateurState
  