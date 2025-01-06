import { Utilisateur, UtilisateurState } from './Utilisateur'

export class Administrateur extends Utilisateur {
  readonly #peutGerer = true

  override get state(): AdministrateurState {
    return super.state
  }

  override peutGerer(): boolean {
    return this.#peutGerer
  }
}

type AdministrateurState = UtilisateurState
