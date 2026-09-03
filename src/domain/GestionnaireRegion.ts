import { Region, RegionState } from './Region'
import { Role } from './Role'
import { StructureUid } from './Structure'
import { Email, Nom, Prenom, Telephone, Utilisateur, UtilisateurState, UtilisateurUid } from './Utilisateur'

export class GestionnaireRegion extends Utilisateur {
  override get state(): GestionnaireRegionState {
    return {
      ...super.state,
      region: this.#region.state,
      ...(this.#structureUid === undefined ? {} : { structureUid: this.#structureUid.state }),
    }
  }

  readonly #region: Region
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
    region: Region,
    derniereConnexion?: Date,
    structureUid?: StructureUid
  ) {
    super(
      uid,
      new Role('Gestionnaire région'),
      nom,
      prenom,
      emailDeContact,
      isSuperAdmin,
      isBetaTesteur,
      inviteLe,
      telephone,
      derniereConnexion
    )
    this.#region = region
    this.#structureUid = structureUid
  }

  override peutGerer(autre: Utilisateur): boolean {
    return autre instanceof GestionnaireRegion && autre.#region.equals(this.#region)
  }
}

type GestionnaireRegionState = Readonly<{ region: RegionState }> & UtilisateurState
