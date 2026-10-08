import { GestionnaireDepartement } from './GestionnaireDepartement'
import { GestionnaireStructure } from './GestionnaireStructure'
import { Utilisateur } from './Utilisateur'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LieuInclusion {
  /**
   * Détermine si un utilisateur peut modifier un lieu d'inclusion selon les règles métier :
   * - Les administrateurs peuvent modifier tous les lieux
   * - Les gestionnaires de département peuvent modifier les lieux de leur département
   * - Les gestionnaires de structure peuvent modifier les lieux où ils ont une personne affectée
   * - Les gestionnaires d'une structure co-porteuse d'une gouvernance peuvent modifier les lieux
   *   du département de cette gouvernance, comme un gestionnaire de département
   */
  static peutEtreModifiePar(
    utilisateur: Utilisateur,
    codeDepartementLieu: string | undefined,
    structureId: number,
    nombrePersonnesAffectees: number,
    departementsCoportes: ReadonlyArray<string> = []
  ): boolean {
    // Les administrateurs peuvent modifier tous les lieux
    if (utilisateur.isAdmin) {
      return true
    }

    // Les gestionnaires de département peuvent modifier les lieux de leur département
    if (
      utilisateur instanceof GestionnaireDepartement &&
      codeDepartementLieu !== undefined &&
      codeDepartementLieu === utilisateur.state.departement.code
    ) {
      return true
    }

    // Les gestionnaires de structure peuvent modifier les lieux où ils ont une personne affectée
    if (utilisateur instanceof GestionnaireStructure) {
      const structureUidValue = utilisateur.state.structureUid.value
      const gereLeMemeLieu = structureUidValue === structureId
      const aDesPersonnesAffectees = nombrePersonnesAffectees > 0
      if (gereLeMemeLieu && aDesPersonnesAffectees) {
        return true
      }

      // Une structure co-porteuse d'une gouvernance a les droits d'un gestionnaire de ce département
      if (codeDepartementLieu !== undefined && departementsCoportes.includes(codeDepartementLieu)) {
        return true
      }
    }

    return false
  }
}
