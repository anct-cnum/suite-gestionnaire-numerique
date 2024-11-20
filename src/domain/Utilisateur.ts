import { Role, TypologieRole, type RoleState } from './Role'
import { Exception } from './shared/Exception'
import { Entity, Uid, ValueObject } from './shared/Model'
import { isEmpty, Result } from '@/shared/lang'
import { emailPattern, telephonePattern } from '@/shared/patterns'

export class Utilisateur extends Entity<UtilisateurState> {
  readonly #isSuperAdmin: boolean
  readonly #derniereConnexion: Date | null
  #role: Role
  #nom: Nom
  #prenom: Prenom
  #email: Email
  #telephone: Telephone
  #inviteLe: Date

  private constructor(
    uid: UtilisateurUid,
    role: Role,
    nom: Nom,
    prenom: Prenom,
    email: Email,
    isSuperAdmin: boolean,
    inviteLe: Date,
    derniereConnexion: Date | null,
    telephone: Telephone
  ) {
    super(uid)
    this.#role = role
    this.#nom = nom
    this.#prenom = prenom
    this.#email = email
    this.#derniereConnexion = derniereConnexion
    this.#isSuperAdmin = isSuperAdmin
    this.#telephone = telephone
    this.#inviteLe = inviteLe
  }

  static create(utilisateur: UtilisateurParams): Utilisateur {
    return new Utilisateur(
      UtilisateurUid.from(utilisateur.uid),
      new Role(utilisateur.role, utilisateur.organisation),
      new Nom(utilisateur.nom),
      new Prenom(utilisateur.prenom),
      new Email(utilisateur.email),
      utilisateur.isSuperAdmin,
      utilisateur.inviteLe,
      utilisateur.derniereConnexion,
      new Telephone(utilisateur.telephone ?? '')
    )
  }

  override state(): UtilisateurState {
    return {
      derniereConnexion: this.#derniereConnexion ? this.#derniereConnexion.toJSON() : new Date(0).toJSON(),
      email: this.#email.state().value,
      inviteLe: this.#inviteLe.toJSON(),
      isActive: this.#derniereConnexion !== null,
      isSuperAdmin: this.#isSuperAdmin,
      nom: this.#nom.state().value,
      prenom: this.#prenom.state().value,
      role: this.#role.state(),
      telephone: this.#telephone.state().value,
      uid: this.uid.state(),
    }
  }

  duMemeRole(params: Omit<UtilisateurParams, 'role'>): Utilisateur {
    return new Utilisateur(
      UtilisateurUid.from(params.uid),
      this.#role,
      new Nom(params.nom),
      new Prenom(params.prenom),
      new Email(params.email),
      params.isSuperAdmin,
      params.inviteLe,
      params.derniereConnexion,
      new Telephone(params.telephone ?? '')
    )
  }

  avecNouvelUid(uid: string): Utilisateur {
    return new Utilisateur(
      UtilisateurUid.from(uid),
      this.#role,
      this.#nom,
      this.#prenom,
      this.#email,
      this.#isSuperAdmin,
      this.#inviteLe,
      this.#derniereConnexion,
      this.#telephone
    )
  }

  changerPrenom(prenom: string): Result<UtilisateurFailure> {
    return Exception.toResult<UtilisateurFailure>(() => {
      this.#prenom = new Prenom(prenom)
    })
  }

  changerNom(nom: string): Result<UtilisateurFailure> {
    return Exception.toResult<UtilisateurFailure>(() => {
      this.#nom = new Nom(nom)
    })
  }

  changerEmail(email: string): Result<UtilisateurFailure> {
    return Exception.toResult<UtilisateurFailure>(() => {
      this.#email = new Email(email)
    })
  }

  changerTelephone(telephone: string): Result<UtilisateurFailure> {
    return Exception.toResult<UtilisateurFailure>(() => {
      this.#telephone = new Telephone(telephone)
    })
  }

  changerLaDateDInvitation(inviteLe: Date): void {
    this.#inviteLe = inviteLe
  }

  changerRole(nouveauRole: TypologieRole): Result<UtilisateurFailure> {
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
  derniereConnexion: string
  email: string
  inviteLe: string
  isActive: boolean
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: RoleState
  telephone: string
}>

export type UtilisateurFailure =
  | 'utilisateurNonAutoriseAChangerSonRole'
  | 'prenomAbsent'
  | 'nomAbsent'
  | 'emailInvalide'
  | 'telephoneInvalide'

class Nom extends ValueObject<AttributUtilisateurState> {
  constructor(value: string) {
    if (isEmpty(value)) {
      throw Exception.of('nomAbsent')
    }
    super({ value })
  }
}

class Prenom extends ValueObject<AttributUtilisateurState> {
  constructor(value: string) {
    if (isEmpty(value)) {
      throw Exception.of('prenomAbsent')
    }
    super({ value })
  }
}

class Email extends ValueObject<AttributUtilisateurState> {
  constructor(value: string) {
    if (!emailPattern.test(value)) {
      throw Exception.of('emailInvalide')
    }
    super({ value })
  }
}

class Telephone extends ValueObject<AttributUtilisateurState> {
  constructor(value: string) {
    if (!(isEmpty(value) || telephonePattern.test(value))) {
      throw Exception.of('telephoneInvalide')
    }
    super({ value })
  }
}

type AttributUtilisateurState = Readonly<{ value: string }>

type UtilisateurUidState = Readonly<{ value: string }>

type UtilisateurParams = Readonly<{
  uid: string
  derniereConnexion: Date | null
  email: string
  inviteLe: Date
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: TypologieRole
  telephone?: string
  organisation?: string
}>
