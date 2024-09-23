import { Role, type RoleState } from './Role'
import { Entity } from './shared/Model'
import { Result } from '@/util/result'

export class Utilisateur extends Entity<UtilisateurId> {
  #role: Role
  readonly #isSuperAdmin: boolean
  readonly #nom: string
  readonly #prenom: string
  readonly #email: string

  constructor(
    uid: UtilisateurId,
    role: Role,
    nom: string,
    prenom: string,
    email: string,
    isSuperAdmin: boolean
  ) {
    super(uid)
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
      uid: this.uid,
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

type UtilisateurId = string

export type UtilisateurState = Readonly<{
  uid: string
  email: string
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: RoleState
}>

export type InvariantUtilisateur = 'utilisateurNonAutoriseAChangerSonRole'
