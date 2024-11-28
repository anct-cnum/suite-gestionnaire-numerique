import { GroupementState, GroupementUid } from './Groupement'
import { Role } from './Role'
import { Email, Nom, Prenom, Telephone, Utilisateur, UtilisateurState, UtilisateurUid } from './Utilisateur'

export class GestionnaireGroupement extends Utilisateur {
  readonly #groupementUid: GroupementUid

  constructor(
    uid: UtilisateurUid,
    nom: Nom,
    prenom: Prenom,
    emailDeContact: Email,
    isSuperAdmin: boolean,
    inviteLe: Date,
    derniereConnexion: Date,
    telephone: Telephone,
    groupementUid: GroupementUid
  ) {
    super(
      uid,
      new Role('Gestionnaire groupement'),
      nom,
      prenom,
      emailDeContact,
      isSuperAdmin,
      inviteLe,
      derniereConnexion,
      telephone
    )
    this.#groupementUid = groupementUid
  }

  override state(): GestionnaireGroupementState {
    return {
      ...super.state(),
      groupementUid: this.#groupementUid.state(),
    }
  }

  override peutGerer(autre: Utilisateur): boolean {
    return autre instanceof GestionnaireGroupement && autre.#groupementUid.equals(this.#groupementUid)
  }
}

export type GestionnaireGroupementState = UtilisateurState &
  Readonly<{ groupementUid: GroupementState['uid'] }>
