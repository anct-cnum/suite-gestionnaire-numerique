import { Utilisateur, UtilisateurState } from './Utilisateur'

export class Administrateur extends Utilisateur {
  override get state(): AdministrateurState {
    return super.state
  }

  override get isAdmin(): boolean {
    return true
  }

  override peutGerer(): boolean {
    return true
  }
}

type AdministrateurState = UtilisateurState
