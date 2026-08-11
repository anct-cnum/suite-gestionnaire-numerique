import { Departement, DepartementState } from './Departement'
import { Role } from './Role'
import { StructureUid } from './Structure'
import { Email, Nom, Prenom, Telephone, Utilisateur, UtilisateurState, UtilisateurUid } from './Utilisateur'

export class GestionnaireDepartement extends Utilisateur {
  override get state(): GestionnaireDepartementState {
    return {
      ...super.state,
      departement: this.#departement.state,
      ...(this.#structureUid === undefined ? {} : { structureUid: this.#structureUid.state }),
    }
  }

  readonly #departement: Departement
  readonly #structureUid?: StructureUid

  constructor(
    uid: UtilisateurUid,
    nom: Nom,
    prenom: Prenom,
    emailDeContact: Email,
    isSuperAdmin: boolean,
    isBetaTesteur: boolean,
    inviteLe: Date,
    telephone: Telephone,
    departement: Departement,
    derniereConnexion?: Date,
    structureUid?: StructureUid
  ) {
    super(
      uid,
      new Role('Gestionnaire département'),
      nom,
      prenom,
      emailDeContact,
      isSuperAdmin,
      isBetaTesteur,
      inviteLe,
      telephone,
      derniereConnexion
    )
    this.#departement = departement
    this.#structureUid = structureUid
  }

  override peutGerer(autre: Utilisateur): boolean {
    return autre instanceof GestionnaireDepartement && autre.#departement.equals(this.#departement)
  }
}

type GestionnaireDepartementState = Readonly<{ departement: DepartementState }> & UtilisateurState
