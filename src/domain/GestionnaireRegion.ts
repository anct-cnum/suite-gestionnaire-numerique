import { Region, RegionState } from './Region'
import { Role } from './Role'
import { Email, Nom, Prenom, Telephone, Utilisateur, UtilisateurState, UtilisateurUid } from './Utilisateur'

export class GestionnaireRegion extends Utilisateur {
  readonly #region: Region

  constructor(
    uid: UtilisateurUid,
    nom: Nom,
    prenom: Prenom,
    emailDeContact: Email,
    isSuperAdmin: boolean,
    inviteLe: Date,
    derniereConnexion: Date,
    telephone: Telephone,
    region: Region
  ) {
    super(
      uid,
      new Role('Gestionnaire région'),
      nom,
      prenom,
      emailDeContact,
      isSuperAdmin,
      inviteLe,
      derniereConnexion,
      telephone
    )
    this.#region = region
  }

  override get state(): GestionnaireRegionState {
    return {
      ...super.state,
      region: this.#region.state,
    }
  }

  override peutGerer(autre: Utilisateur): boolean {
    return autre instanceof GestionnaireRegion && autre.#region.equals(this.#region)
  }
}

type GestionnaireRegionState = UtilisateurState & Readonly<{ region: RegionState }>
