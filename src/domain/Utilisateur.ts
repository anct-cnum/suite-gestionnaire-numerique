import { DepartementState } from './Departement'
import { GroupementState } from './Groupement'
import { RegionState } from './Region'
import { Role, type RoleState, TypologieRole } from './Role'
import { Exception } from './shared/Exception'
import { Entity, Uid, ValueObject } from './shared/Model'
import { ValidDate } from './shared/ValidDate'
import { StructureState } from './Structure'
import { isEmpty, Result } from '@/shared/lang'
import { emailPattern, telephonePattern } from '@/shared/patterns'

export abstract class Utilisateur extends Entity<UtilisateurState> {
  get isAdmin(): boolean {
    return this.#isAdmin
  }

  get isSuperAdmin(): boolean {
    return this.#isSuperAdmin
  }

  override get state(): UtilisateurState {
    return {
      derniereConnexion: this.#derniereConnexion?.toJSON(),
      emailDeContact: this.#emailDeContact.state.value,
      inviteLe: this.#inviteLe.toJSON(),
      isActive: Boolean(this.#derniereConnexion),
      isSuperAdmin: this.#isSuperAdmin,
      nom: this.#nom.state.value,
      prenom: this.#prenom.state.value,
      role: this.#role.state,
      telephone: this.#telephone.state.value,
      uid: this.uid.state,
    }
  }

  #derniereConnexion?: ValidDate<UtilisateurFailure>
  #emailDeContact: Email
  #inviteLe: ValidDate<UtilisateurFailure>
  readonly #isAdmin = false
  readonly #isSuperAdmin: boolean
  #nom: Nom
  #prenom: Prenom
  #role: Role
  #telephone: Telephone

  constructor(
    uid: UtilisateurUid,
    role: Role,
    nom: Nom,
    prenom: Prenom,
    emailDeContact: Email,
    isSuperAdmin: boolean,
    inviteLe: Date,
    telephone: Telephone,
    derniereConnexion?: Date
  ) {
    super(uid)
    this.#role = role
    this.#nom = nom
    this.#prenom = prenom
    this.#emailDeContact = emailDeContact
    this.#isSuperAdmin = isSuperAdmin
    this.#derniereConnexion = derniereConnexion
      ? new ValidDate(derniereConnexion, 'dateDeDerniereConnexionInvalide')
      : derniereConnexion
    this.#inviteLe = new ValidDate(inviteLe, 'dateDInvitationInvalide')
    this.#telephone = telephone
  }

  changerDateDeDerniereConnexion(date: Date): void {
    this.#derniereConnexion = new ValidDate(date, 'dateDeDerniereConnexionInvalide')
  }

  changerDateDInvitation(inviteLe: Date): void {
    this.#inviteLe = new ValidDate(inviteLe, 'dateDInvitationInvalide')
  }

  changerEmail(email: string): Result<UtilisateurFailure> {
    return Exception.toResult<UtilisateurFailure>(() => {
      this.#emailDeContact = new Email(email)
    })
  }

  changerNom(nom: string): Result<UtilisateurFailure> {
    return Exception.toResult<UtilisateurFailure>(() => {
      this.#nom = new Nom(nom)
    })
  }

  changerPrenom(prenom: string): Result<UtilisateurFailure> {
    return Exception.toResult<UtilisateurFailure>(() => {
      this.#prenom = new Prenom(prenom)
    })
  }

  changerRole(nouveauRole: TypologieRole): Result<UtilisateurFailure> {
    if (this.#isSuperAdmin) {
      this.#role = new Role(nouveauRole)
      return 'OK'
    }
    return 'utilisateurNonAutoriseAChangerSonRole'
  }

  changerTelephone(telephone: string): Result<UtilisateurFailure> {
    return Exception.toResult<UtilisateurFailure>(() => {
      this.#telephone = new Telephone(telephone)
    })
  }

  abstract peutGerer(autre: Utilisateur): boolean
}

export class UtilisateurUid extends Uid<UtilisateurUidState> {}

export type UtilisateurUidState = Readonly<{
  email: string
  value: string
}>

export type UtilisateurState = Readonly<{
  departement?: DepartementState
  derniereConnexion?: string
  emailDeContact: string
  groupementUid?: GroupementState['uid']
  inviteLe: string
  isActive: boolean
  isSuperAdmin: boolean
  nom: string
  prenom: string
  region?: RegionState
  role: RoleState
  structureUid?: StructureState['uid']
  telephone: string
  uid: UtilisateurUidState
}>

export type UtilisateurFailure =
  | 'dateDeDerniereConnexionInvalide'
  | 'dateDInvitationInvalide'
  | 'emailInvalide'
  | 'nomAbsent'
  | 'prenomAbsent'
  | 'telephoneInvalide'
  | 'utilisateurNonAutoriseAChangerSonRole'

export class Nom extends ValueObject<AttributUtilisateurState> {
  constructor(value: string) {
    if (isEmpty(value)) {
      throw Exception.of('nomAbsent')
    }
    super({ value })
  }
}

export class Prenom extends ValueObject<AttributUtilisateurState> {
  constructor(value: string) {
    if (isEmpty(value)) {
      throw Exception.of('prenomAbsent')
    }
    super({ value })
  }
}

export class Email extends ValueObject<AttributUtilisateurState> {
  constructor(value: string) {
    if (!emailPattern.test(value)) {
      throw Exception.of('emailInvalide')
    }
    super({ value })
  }
}

export class Telephone extends ValueObject<AttributUtilisateurState> {
  constructor(value: string) {
    if (!(isEmpty(value) || telephonePattern.test(value))) {
      throw Exception.of('telephoneInvalide')
    }
    super({ value })
  }
}

type AttributUtilisateurState = Readonly<{ value: string }>
