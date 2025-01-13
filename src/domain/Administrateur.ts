import { Utilisateur, UtilisateurState } from './Utilisateur'

export class Administrateur extends Utilisateur {
  readonly #peutGerer = true
  readonly #isAdmin = true

  override get state(): AdministrateurState {
    return super.state
  }

  override get isAdmin(): boolean {
    return this.#isAdmin
  }

  override peutGerer(): boolean {
    return this.#peutGerer
  }
}

type AdministrateurState = UtilisateurState
