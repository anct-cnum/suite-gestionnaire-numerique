import { Role, TypologieRole, type RoleState } from './Role'
import { Entity } from './shared/Model'
import { Result } from '@/util/result'

export class Utilisateur extends Entity<UtilisateurUid> {
  #role: Role
  readonly #isSuperAdmin: boolean
  readonly #nom: string
  readonly #prenom: string
  readonly #email: string

  private constructor(
    uid: UtilisateurUid,
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

  static create(
    utilisateur: UtilisateurParams
  ): Utilisateur {
    return new Utilisateur(
      utilisateur.uid,
      new Role(utilisateur.role, utilisateur.organisation),
      utilisateur.nom,
      utilisateur.prenom,
      utilisateur.email,
      utilisateur.isSuperAdmin
    )
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

type UtilisateurUid = string

export type UtilisateurState = Readonly<{
  uid: string
  email: string
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: RoleState
}>

type UtilisateurParams = Readonly<{
  uid: string
  email: string
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: TypologieRole,
  organisation?: string
}>

export type InvariantUtilisateur = 'utilisateurNonAutoriseAChangerSonRole'
