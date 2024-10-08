import { Role, TypologieRole, type RoleState } from './Role'
import { Entity } from './shared/Model'
import { Result } from '@/util/result'

export class Utilisateur extends Entity<UtilisateurState> {
  readonly #isSuperAdmin: boolean
  readonly #email: string
  #role: Role
  #nom: string
  #prenom: string

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

  changerPrenom(prenom: string): void {
    this.#prenom = prenom
  }

  changerNom(nom: string): void {
    this.#nom = nom
  }

  changerRole(nouveauRole: TypologieRole): Result<InvariantUtilisateur> {
    if (this.#isSuperAdmin) {
      this.#role = new Role(nouveauRole)
      return 'OK'
    }
    return 'utilisateurNonAutoriseAChangerSonRole'
  }

  peutSupprimer(autre: Utilisateur): boolean {
    return this.#role.isAdmin() || this.#role.equals(autre.#role)
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
