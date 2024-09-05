import { Role, type RoleState } from './Role'
import { Model } from './shared/Model'
import { Result } from '@/util/result'

export class Utilisateur implements Model {
  #role: Role
  readonly #isSuperAdmin: boolean
  readonly #nom: string
  readonly #prenom: string
  readonly #email: string

  constructor(role: Role, nom: string, prenom: string, email: string, isSuperAdmin = false) {
    this.#role = role
    this.#nom = nom
    this.#prenom = prenom
    this.#email = email
    this.#isSuperAdmin = isSuperAdmin
  }

  state(): UtilisateurState {
    return {
      email: this.#email,
      isSuperAdmin: this.#isSuperAdmin,
      nom: this.#nom,
      prenom: this.#prenom,
      role: this.#role.state(),
    }
  }

  changerRole(nouveauRole: Role): Result<InvariantUtilisateur> {
    if (this.#isSuperAdmin) {
      this.#role = nouveauRole
      return 'OK'
    }

    return 'utilisateurNonAutoriseAChangerSonRole'
  }
}

export type UtilisateurState = Readonly<{
  email: string
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: RoleState
}>

export type InvariantUtilisateur = 'utilisateurNonAutoriseAChangerSonRole'
