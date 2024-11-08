import { Role, TypologieRole, type RoleState } from './Role'
import { Exception } from './shared/Exception'
import { Entity, Uid, ValueObject } from './shared/Model'
import { isEmpty, Result } from '@/shared/lang'

export class Utilisateur extends Entity<UtilisateurState> {
  readonly #isSuperAdmin: boolean
  #role: Role
  #nom: Nom
  #prenom: Prenom
  #email: Email
  #telephone: Telephone

  private constructor(
    uid: UtilisateurUid,
    role: Role,
    nom: Nom,
    prenom: Prenom,
    email: Email,
    isSuperAdmin: boolean,
    telephone: Telephone
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
      new Nom(utilisateur.nom),
      new Prenom(utilisateur.prenom),
      new Email(utilisateur.email),
      utilisateur.isSuperAdmin,
      new Telephone(utilisateur.telephone ?? '')
    )
  }

  override state(): UtilisateurState {
    return {
      email: this.#email.state().value,
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
      new Telephone(params.telephone ?? '')
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
  email: string
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

const emailPattern = /.+@.+\..{2,}/

const telephonePattern = /\+[0-9]{11,12}|[0-9]{10}/

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
  email: string
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: TypologieRole
  telephone?: string
  organisation?: string
}>
