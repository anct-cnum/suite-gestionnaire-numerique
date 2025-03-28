import { Role } from './Role'
import { StructureState, StructureUid } from './Structure'
import { Email, Nom, Prenom, Telephone, Utilisateur, UtilisateurState, UtilisateurUid } from './Utilisateur'

export class GestionnaireStructure extends Utilisateur {
  override get state(): GestionnaireStructureState {
    return {
      ...super.state,
      structureUid: this.#structureUid.state,
    }
  }

  readonly #structureUid: StructureUid

  constructor(
    uid: UtilisateurUid,
    nom: Nom,
    prenom: Prenom,
    emailDeContact: Email,
    isSuperAdmin: boolean,
    inviteLe: Date,
    telephone: Telephone,
    structureUid: StructureUid,
    derniereConnexion?: Date
  ) {
    super(
      uid,
      new Role('Gestionnaire structure'),
      nom,
      prenom,
      emailDeContact,
      isSuperAdmin,
      inviteLe,
      telephone,
      derniereConnexion
    )
    this.#structureUid = structureUid
  }

  override peutGerer(autre: Utilisateur): boolean {
    return autre instanceof GestionnaireStructure && autre.#structureUid.equals(this.#structureUid)
  }
}

type GestionnaireStructureState = Readonly<{ structureUid: StructureState['uid'] }> &
  UtilisateurState
