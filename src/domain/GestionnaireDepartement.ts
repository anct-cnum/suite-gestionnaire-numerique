import { Departement, DepartementState } from './Departement'
import { Role } from './Role'
import { Email, Nom, Prenom, Telephone, Utilisateur, UtilisateurState, UtilisateurUid } from './Utilisateur'

export class GestionnaireDepartement extends Utilisateur {
  readonly #departement: Departement

  constructor(
    uid: UtilisateurUid,
    nom: Nom,
    prenom: Prenom,
    email: Email,
    isSuperAdmin: boolean,
    inviteLe: Date,
    derniereConnexion: Date,
    telephone: Telephone,
    departement: Departement
  ) {
    super(
      uid,
      new Role('Gestionnaire département'),
      nom,
      prenom,
      email,
      isSuperAdmin,
      inviteLe,
      derniereConnexion,
      telephone
    )
    this.#departement = departement
  }

  override state(): GestionnaireDepartementState {
    return {
      ...super.state(),
      departement: this.#departement.state(),
    }
  }

  override peutGerer(autre: Utilisateur): boolean {
    return autre instanceof GestionnaireDepartement && autre.#departement.equals(this.#departement)
  }
}

export type GestionnaireDepartementState = UtilisateurState &
  Readonly<{ departement: DepartementState }>
