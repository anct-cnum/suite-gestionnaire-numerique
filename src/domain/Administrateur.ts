import { Utilisateur, UtilisateurState } from './Utilisateur'

export class Administrateur extends Utilisateur {
  override state(): AdministrateurState {
    return super.state()
  }

  override peutGerer(): boolean {
    return true
  }
}

export type AdministrateurState = UtilisateurState
