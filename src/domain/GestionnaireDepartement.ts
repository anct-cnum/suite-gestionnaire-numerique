import { Departement, DepartementState } from './Departement'
import { Role } from './Role'
import { Email, Nom, Prenom, Telephone, Utilisateur, UtilisateurState, UtilisateurUid } from './Utilisateur'

export class GestionnaireDepartement extends Utilisateur {
  override get state(): GestionnaireDepartementState {
    return {
      ...super.state,
      departement: this.#departement.state,
    }
  }

  readonly #departement: Departement

  constructor(
    uid: UtilisateurUid,
    nom: Nom,
    prenom: Prenom,
    emailDeContact: Email,
    isSuperAdmin: boolean,
    inviteLe: Date,
    telephone: Telephone,
    departement: Departement,
    derniereConnexion?: Date
  ) {
    super(
      uid,
      new Role('Gestionnaire département'),
      nom,
      prenom,
      emailDeContact,
      isSuperAdmin,
      inviteLe,
      telephone,
      derniereConnexion
    )
    this.#departement = departement
  }

  override peutGerer(autre: Utilisateur): boolean {
    return (
      this.isSuperAdmin ||
      autre instanceof GestionnaireDepartement && autre.#departement.equals(this.#departement)
    )
  }
}

type GestionnaireDepartementState = Readonly<{ departement: DepartementState }> &
  UtilisateurState
