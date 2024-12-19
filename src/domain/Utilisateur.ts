import { DepartementState } from './Departement'
import { GroupementState } from './Groupement'
import { RegionState } from './Region'
import { Role, TypologieRole, type RoleState } from './Role'
import { Exception } from './shared/Exception'
import { Entity, Uid, ValueObject } from './shared/Model'
import { ValidDate } from './shared/ValidDate'
import { StructureState } from './Structure'
import { isEmpty, Result } from '@/shared/lang'
import { emailPattern, telephonePattern } from '@/shared/patterns'

export abstract class Utilisateur extends Entity<UtilisateurState> {
  readonly #isSuperAdmin: boolean
  #derniereConnexion: ValidDate<UtilisateurFailure>
  #role: Role
  #nom: Nom
  #prenom: Prenom
  #emailDeContact: Email
  #telephone: Telephone
  #inviteLe: ValidDate<UtilisateurFailure>

  constructor(
    uid: UtilisateurUid,
    role: Role,
    nom: Nom,
    prenom: Prenom,
    emailDeContact: Email,
    isSuperAdmin: boolean,
    inviteLe: ValidDate<UtilisateurFailure>,
    derniereConnexion: ValidDate<UtilisateurFailure>,
    telephone: Telephone
  ) {
    super(uid)
    this.#role = role
    this.#nom = nom
    this.#prenom = prenom
    this.#emailDeContact = emailDeContact
    this.#isSuperAdmin = isSuperAdmin
    this.#derniereConnexion = derniereConnexion
    this.#inviteLe = inviteLe
    this.#telephone = telephone
  }

  override get state(): UtilisateurState {
    return {
      derniereConnexion: this.#derniereConnexion.toJSON(),
      emailDeContact: this.#emailDeContact.state.value,
      inviteLe: this.#inviteLe.toJSON(),
      isActive: this.#derniereConnexion.getTime() !== 0,
      isSuperAdmin: this.#isSuperAdmin,
      nom: this.#nom.state.value,
      prenom: this.#prenom.state.value,
      role: this.#role.state,
      telephone: this.#telephone.state.value,
      uid: this.uid.state,
    }
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
      this.#emailDeContact = new Email(email)
    })
  }

  changerTelephone(telephone: string): Result<UtilisateurFailure> {
    return Exception.toResult<UtilisateurFailure>(() => {
      this.#telephone = new Telephone(telephone)
    })
  }

  changerDateDInvitation(inviteLe: Date): void {
    this.#inviteLe = new ValidDate(inviteLe, 'dateDInvitationInvalide')
  }

  changerRole(nouveauRole: TypologieRole): Result<UtilisateurFailure> {
    if (this.#isSuperAdmin) {
      this.#role = new Role(nouveauRole)
      return 'OK'
    }
    return 'utilisateurNonAutoriseAChangerSonRole'
  }

  changerDateDeDerniereConnexion(date: Date): void {
    this.#derniereConnexion = new ValidDate(date, 'dateDeDerniereConnexionInvalide')
  }

  abstract peutGerer(autre: Utilisateur): boolean
}

export class UtilisateurUid extends Uid<UtilisateurUidState> {}

export type UtilisateurUidState = Readonly<{ value: string, email: string }>

export type UtilisateurState = Readonly<{
  uid: UtilisateurUidState
  derniereConnexion: string
  emailDeContact: string
  inviteLe: string
  isActive: boolean
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: RoleState
  telephone: string
  departement?: DepartementState
  groupementUid?: GroupementState['uid']
  region?: RegionState
  structureUid?: StructureState['uid']
}>

export type UtilisateurFailure =
  | 'utilisateurNonAutoriseAChangerSonRole'
  | 'prenomAbsent'
  | 'nomAbsent'
  | 'emailInvalide'
  | 'telephoneInvalide'
  | 'dateDeDerniereConnexionInvalide'
  | 'dateDInvitationInvalide'

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
