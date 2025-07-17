import { GroupementState, GroupementUid } from './Groupement'
import { Role } from './Role'
import { Email, Nom, Prenom, Telephone, Utilisateur, UtilisateurState, UtilisateurUid } from './Utilisateur'

export class GestionnaireGroupement extends Utilisateur {
  override get state(): GestionnaireGroupementState {
    return {
      ...super.state,
      groupementUid: this.#groupementUid.state,
    }
  }

  readonly #groupementUid: GroupementUid

  constructor(
    uid: UtilisateurUid,
    nom: Nom,
    prenom: Prenom,
    emailDeContact: Email,
    isSuperAdmin: boolean,
    inviteLe: Date,
    telephone: Telephone,
    groupementUid: GroupementUid,
    derniereConnexion?: Date
  ) {
    super(
      uid,
      new Role('Gestionnaire groupement'),
      nom,
      prenom,
      emailDeContact,
      isSuperAdmin,
      inviteLe,
      telephone,
      derniereConnexion
    )
    this.#groupementUid = groupementUid
  }

  override peutGerer(autre: Utilisateur): boolean {
    return (
      this.isSuperAdmin ||
      autre instanceof GestionnaireGroupement && autre.#groupementUid.equals(this.#groupementUid)
    )
  }
}

type GestionnaireGroupementState = Readonly<{ groupementUid: GroupementState['uid'] }> &
  UtilisateurState
