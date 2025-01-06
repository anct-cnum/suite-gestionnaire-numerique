import { Administrateur } from './Administrateur'
import { Departement, DepartementState } from './Departement'
import { GestionnaireDepartement } from './GestionnaireDepartement'
import { GestionnaireGroupement } from './GestionnaireGroupement'
import { GestionnaireRegion } from './GestionnaireRegion'
import { GestionnaireStructure } from './GestionnaireStructure'
import { GroupementUid } from './Groupement'
import { Region, RegionState } from './Region'
import { Role, TypologieRole } from './Role'
import { ValidDate } from './shared/ValidDate'
import { StructureUid } from './Structure'
import { Email, Nom, Prenom, Telephone, Utilisateur, UtilisateurUid, UtilisateurUidState } from './Utilisateur'

export class UtilisateurFactory {
  readonly #uid: UtilisateurUid
  readonly #nom: Nom
  readonly #prenom: Prenom
  readonly #emailDeContact: Email
  readonly #isSuperAdmin: boolean
  readonly #inviteLe: Date
  readonly #derniereConnexion: Date
  readonly #telephone: Telephone
  readonly #departement?: DepartementState
  readonly #region?: RegionState
  readonly #structureUid?: number
  readonly #groupementUid?: number

  constructor(params: UtilisateurFactoryParams) {
    this.#uid = new UtilisateurUid(params.uid)
    this.#nom = new Nom(params.nom)
    this.#prenom = new Prenom(params.prenom)
    this.#emailDeContact = new Email(params.emailDeContact)
    this.#isSuperAdmin = params.isSuperAdmin
    this.#inviteLe = params.inviteLe
    this.#derniereConnexion = params.derniereConnexion ?? new Date(0)
    this.#telephone = new Telephone(params.telephone ?? '')
    // TEMPORAIRE, EN ATTENDANT D'IMPLÉMENTER LES CONTRÔLES DE COHÉRENCE
    this.#departement = params.departement
    this.#region = params.region
    this.#structureUid = params.structureUid
    this.#groupementUid = params.groupementUid
  }

  static avecNouvelUid(utilisateur: Utilisateur, uid: string): Utilisateur {
    const state = utilisateur.state
    return new UtilisateurFactory({
      departement: state.departement,
      derniereConnexion: new Date(state.derniereConnexion),
      emailDeContact: state.emailDeContact,
      groupementUid: state.groupementUid?.value,
      inviteLe: new Date(state.inviteLe),
      isSuperAdmin: state.isSuperAdmin,
      nom: state.nom,
      prenom: state.prenom,
      region: state.region,
      structureUid: state.structureUid?.value,
      telephone: state.telephone,
      uid: { email: state.uid.email, value: uid },
    }).create(state.role.nom)
  }

  create(role: TypologieRole, codeOrganisation = ''): Utilisateur {
    switch (role) {
      case 'Gestionnaire département':
        return this.#createGestionnaireDepartement(codeOrganisation)
      case 'Gestionnaire région':
        return this.#createGestionnaireRegion(codeOrganisation)
      case 'Gestionnaire structure':
        return this.#createGestionnaireStructure(Number(codeOrganisation))
      case 'Gestionnaire groupement':
        return this.#createGestionnaireGroupement(Number(codeOrganisation))
      default:
        return this.#createAdministrateur(new Role(role))
    }
  }

  #createGestionnaireDepartement(code: string): Utilisateur {
    const departement = new Departement(this.#departement ?? { code, codeRegion: '', nom: '' })
    return new GestionnaireDepartement(
      this.#uid,
      this.#nom,
      this.#prenom,
      this.#emailDeContact,
      this.#isSuperAdmin,
      this.#inviteLe,
      this.#derniereConnexion,
      this.#telephone,
      departement
    )
  }

  #createGestionnaireRegion(code: string): Utilisateur {
    const region = new Region(this.#region ?? { code, nom: '' })
    return new GestionnaireRegion(
      this.#uid,
      this.#nom,
      this.#prenom,
      this.#emailDeContact,
      this.#isSuperAdmin,
      new ValidDate(this.#inviteLe, 'dateDInvitationInvalide'),
      new ValidDate(this.#derniereConnexion, 'dateDeDerniereConnexionInvalide'),
      this.#telephone,
      region
    )
  }

  #createGestionnaireStructure(structureUidValue: number): Utilisateur {
    const structureUid = new StructureUid({ value: this.#structureUid ?? structureUidValue })
    return new GestionnaireStructure(
      this.#uid,
      this.#nom,
      this.#prenom,
      this.#emailDeContact,
      this.#isSuperAdmin,
      new ValidDate(this.#inviteLe, 'dateDInvitationInvalide'),
      new ValidDate(this.#derniereConnexion, 'dateDeDerniereConnexionInvalide'),
      this.#telephone,
      structureUid
    )
  }

  #createGestionnaireGroupement(groupementUidValue: number): Utilisateur {
    const groupementUid = new GroupementUid({ value: this.#groupementUid ?? groupementUidValue })
    return new GestionnaireGroupement(
      this.#uid,
      this.#nom,
      this.#prenom,
      this.#emailDeContact,
      this.#isSuperAdmin,
      new ValidDate(this.#inviteLe, 'dateDInvitationInvalide'),
      new ValidDate(this.#derniereConnexion, 'dateDeDerniereConnexionInvalide'),
      this.#telephone,
      groupementUid
    )
  }

  #createAdministrateur(role: Role): Utilisateur {
    return new Administrateur(
      this.#uid,
      role,
      this.#nom,
      this.#prenom,
      this.#emailDeContact,
      this.#isSuperAdmin,
      new ValidDate(this.#inviteLe, 'dateDInvitationInvalide'),
      new ValidDate(this.#derniereConnexion, 'dateDeDerniereConnexionInvalide'),
      this.#telephone
    )
  }
}

type UtilisateurFactoryParams = Readonly<{
  uid: UtilisateurUidState
  derniereConnexion?: Date
  emailDeContact: string
  inviteLe: Date
  isSuperAdmin: boolean
  nom: string
  prenom: string
  telephone?: string
  departement?: DepartementState
  groupementUid?: number
  region?: RegionState
  structureUid?: number
}>
