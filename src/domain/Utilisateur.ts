import { Role, TypologieRole, type RoleState } from './Role'
import { Entity, Uid } from './shared/Model'
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

  static create(utilisateur: UtilisateurParams): Utilisateur {
    return new Utilisateur(
      UtilisateurUid.from(utilisateur.uid),
      new Role(utilisateur.role, utilisateur.organisation),
      utilisateur.nom,
      utilisateur.prenom,
      utilisateur.email,
      utilisateur.isSuperAdmin,
      utilisateur.telephone
    )
  }

  override state(): UtilisateurState {
    return {
      email: this.#email,
      isSuperAdmin: this.#isSuperAdmin,
      nom: this.#nom,
      prenom: this.#prenom,
      role: this.#role.state(),
      telephone: this.#telephone,
      uid: this.uid.state(),
    }
  }

  duMemeRole(params: Omit<UtilisateurParams, 'role'>): Utilisateur {
    return new Utilisateur(
      UtilisateurUid.from(params.uid),
      this.#role,
      params.nom,
      params.prenom,
      params.email,
      params.isSuperAdmin,
      params.telephone
    )
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

export class UtilisateurUid extends Uid<UtilisateurUidState> {
  private constructor(state: UtilisateurUidState) {
    super(state)
  }

  static from(value: string): UtilisateurUid {
    return new UtilisateurUid({ value })
  }
}

export type UtilisateurState = Readonly<{
  uid: UtilisateurUidState
  email: string
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: RoleState
  telephone: string
}>

export type InvariantUtilisateur = 'utilisateurNonAutoriseAChangerSonRole'

type UtilisateurUidState = Readonly<{value: string}>

type UtilisateurParams = Readonly<{
  uid: string
  email: string
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: TypologieRole
  telephone?: string
  organisation?: string
}>
