import { Administrateur } from './Administrateur'
import { Departement, DepartementState } from './Departement'
import { GestionnaireDepartement } from './GestionnaireDepartement'
import { GestionnaireGroupement } from './GestionnaireGroupement'
import { GestionnaireRegion } from './GestionnaireRegion'
import { GestionnaireStructure } from './GestionnaireStructure'
import { GroupementUid } from './Groupement'
import { Region, RegionState } from './Region'
import { Role, TypologieRole } from './Role'
import { StructureUid } from './Structure'
import { Email, Nom, Prenom, Telephone, Utilisateur, UtilisateurUid, UtilisateurUidState } from './Utilisateur'

export class UtilisateurFactory {
  readonly #departement?: DepartementState
  readonly #derniereConnexion?: Date
  readonly #emailDeContact: Email
  readonly #groupementUid?: number
  readonly #inviteLe: Date
  readonly #isSuperAdmin: boolean
  readonly #nom: Nom
  readonly #prenom: Prenom
  readonly #region?: RegionState
  readonly #structureUid?: number
  readonly #telephone: Telephone
  readonly #uid: UtilisateurUid

  constructor(params: UtilisateurFactoryParams) {
    this.#uid = new UtilisateurUid(params.uid)
    this.#nom = new Nom(params.nom)
    this.#prenom = new Prenom(params.prenom)
    this.#emailDeContact = new Email(params.emailDeContact)
    this.#isSuperAdmin = params.isSuperAdmin
    this.#inviteLe = params.inviteLe
    this.#derniereConnexion = params.derniereConnexion
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
      derniereConnexion: undefined,
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

  // eslint-disable-next-line @typescript-eslint/consistent-return
  create(role: TypologieRole, codeOrganisation = ''): Utilisateur {
    //Suppression du default car tous les cas sont gérés et vérifiés par TypeScript
    // eslint-disable-next-line default-case
    switch (role) {
      case 'Administrateur dispositif':
        return this.#createAdministrateur(new Role(role))
      case 'Gestionnaire département':
        return this.#createGestionnaireDepartement(codeOrganisation)
      case 'Gestionnaire groupement':
        return this.#createGestionnaireGroupement(Number(codeOrganisation))
      case 'Gestionnaire région':
        return this.#createGestionnaireRegion(codeOrganisation)
      case 'Gestionnaire structure':
        return this.#createGestionnaireStructure(Number(codeOrganisation))
    }
  }

  #createAdministrateur(role: Role): Utilisateur {
    return new Administrateur(
      this.#uid,
      role,
      this.#nom,
      this.#prenom,
      this.#emailDeContact,
      this.#isSuperAdmin,
      this.#inviteLe,
      this.#telephone,
      this.#derniereConnexion
    )
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
      this.#telephone,
      departement,
      this.#derniereConnexion
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
      this.#inviteLe,
      this.#telephone,
      groupementUid,
      this.#derniereConnexion
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
      this.#inviteLe,
      this.#telephone,
      region,
      this.#derniereConnexion
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
      this.#inviteLe,
      this.#telephone,
      structureUid,
      this.#derniereConnexion
    )
  }
}

type UtilisateurFactoryParams = Readonly<{
  departement?: DepartementState
  derniereConnexion?: Date
  emailDeContact: string
  groupementUid?: number
  inviteLe: Date
  isSuperAdmin: boolean
  nom: string
  prenom: string
  region?: RegionState
  structureUid?: number
  telephone?: string
  uid: UtilisateurUidState
}>
