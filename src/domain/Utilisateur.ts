import { Role, TypologieRole, type RoleState } from './Role'
import { Entity } from './shared/Model'
import { Result } from '@/shared/lang'

export class Utilisateur extends Entity<UtilisateurState> {
  readonly #isSuperAdmin: boolean
  #role: Role
  #nom: string
  #prenom: string
  #email: string
  #telephone: string

  private constructor(
    uid: UtilisateurUid,
    role: Role,
    nom: string,
    prenom: string,
    email: string,
    isSuperAdmin: boolean,
    telephone = ''
  ) {
    super(uid)
    this.#role = role
    this.#nom = nom
    this.#prenom = prenom
    this.#email = email
    this.#isSuperAdmin = isSuperAdmin
    this.#telephone = telephone
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
      utilisateur.isSuperAdmin,
      utilisateur.telephone
    )
  }

  static createWithoutUid(utilisateur: UtilisateurParamsWithoutUid): Utilisateur {
    return new Utilisateur(
      utilisateur.email,
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
      telephone: this.#telephone,
      uid: this.uid,
    }
  }

  changerPrenom(prenom: string): void {
    this.#prenom = prenom
  }

  changerNom(nom: string): void {
    this.#nom = nom
  }

  changerEmail(email: string): void {
    this.#email = email
  }

  changerTelephone(telephone: string): void {
    this.#telephone = telephone
  }

  changerRole(nouveauRole: TypologieRole): Result<InvariantUtilisateur> {
    if (this.#isSuperAdmin) {
      this.#role = new Role(nouveauRole)
      return 'OK'
    }
    return 'utilisateurNonAutoriseAChangerSonRole'
  }

  peutGerer(autre: Utilisateur): boolean {
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
  telephone: string
}>

export type InvariantUtilisateur = 'utilisateurNonAutoriseAChangerSonRole'

type UtilisateurParams = Readonly<{
  uid: string
  email: string
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: TypologieRole,
  organisation?: string,
  telephone?: string,
}>

type UtilisateurParamsWithoutUid = Omit<UtilisateurParams, 'uid'>
