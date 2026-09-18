import { GestionnaireDepartement } from './GestionnaireDepartement'
import { GestionnaireStructure } from './GestionnaireStructure'
import { Utilisateur } from './Utilisateur'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LieuInclusion {
  /**
   * Création réservée aux administrateurs (#1495). Depuis le retrait du lien
   * lieu ↔ structure (#1711), rien ne rattache un lieu au champ de visibilité
   * d'un gestionnaire : un lieu créé n'a personne dedans et sortirait de sa
   * liste. À élargir quand le périmètre sera tranché.
   */
  static peutEtreCreePar(utilisateur: Utilisateur): boolean {
    return utilisateur.isAdmin
  }

  /**
   * Détermine si un utilisateur peut modifier un lieu d'inclusion selon les règles métier :
   * - Les administrateurs peuvent modifier tous les lieux
   * - Les gestionnaires de département peuvent modifier les lieux de leur département
   * - Les gestionnaires de structure peuvent modifier les lieux où ils ont une personne affectée
   * - Les membres de gouvernance peuvent modifier les lieux dans le département de leur gouvernance
   */
  static peutEtreModifiePar(
    utilisateur: Utilisateur,
    codeDepartementLieu: string | undefined,
    structureId: number,
    nombrePersonnesAffectees: number,
    departementsGouvernances: ReadonlyArray<string> = []
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

      // Les membres (porteur ou co-porteur) d'une gouvernance peuvent modifier
      // les lieux dans le département de leur gouvernance
      if (codeDepartementLieu !== undefined && departementsGouvernances.includes(codeDepartementLieu)) {
        return true
      }
    }

    return false
  }
}
