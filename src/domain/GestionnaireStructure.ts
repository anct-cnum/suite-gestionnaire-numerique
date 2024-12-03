import { Role } from './Role'
import { StructureState, StructureUid } from './Structure'
import { Email, Nom, Prenom, Telephone, Utilisateur, UtilisateurState, UtilisateurUid } from './Utilisateur'

export class GestionnaireStructure extends Utilisateur {
  readonly #structureUid: StructureUid

  constructor(
    uid: UtilisateurUid,
    nom: Nom,
    prenom: Prenom,
    emailDeContact: Email,
    isSuperAdmin: boolean,
    inviteLe: Date,
    derniereConnexion: Date,
    telephone: Telephone,
    structureUid: StructureUid
  ) {
    super(
      uid,
      new Role('Gestionnaire structure'),
      nom,
      prenom,
      emailDeContact,
      isSuperAdmin,
      inviteLe,
      derniereConnexion,
      telephone
    )
    this.#structureUid = structureUid
  }

  override state(): GestionnaireStructureState {
    return {
      ...super.state(),
      structureUid: this.#structureUid.state(),
    }
  }

  override peutGerer(autre: Utilisateur): boolean {
    return autre instanceof GestionnaireStructure && autre.#structureUid.equals(this.#structureUid)
  }
}

export type GestionnaireStructureState = UtilisateurState &
  Readonly<{ structureUid: StructureState['uid'] }>
