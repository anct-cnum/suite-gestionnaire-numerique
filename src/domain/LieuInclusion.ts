import { GestionnaireDepartement } from './GestionnaireDepartement'
import { GestionnaireRegion } from './GestionnaireRegion'
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
   * - Les gestionnaires de région peuvent modifier les lieux de leur région
   * - Les gestionnaires de département peuvent modifier les lieux de leur département
   * - Les gestionnaires de structure peuvent modifier les lieux de leur structure, avec la même
   *   définition que le listing des lieux (tous les employeurs d'un lieu, lieux quittés compris)
   * - Les gestionnaires d'une structure co-porteuse d'une gouvernance peuvent modifier les lieux
   *   du département de cette gouvernance, comme un gestionnaire de département
   */
  static peutEtreModifiePar(
    utilisateur: Utilisateur,
    lieu: LieuAModifier,
    departementsCoportes: ReadonlyArray<string> = []
  ): boolean {
    // Les administrateurs peuvent modifier tous les lieux
    if (utilisateur.isAdmin) {
      return true
    }

    // Les gestionnaires de région peuvent modifier les lieux de leur région
    if (
      utilisateur instanceof GestionnaireRegion &&
      lieu.codeRegion !== undefined &&
      lieu.codeRegion === utilisateur.state.region.code
    ) {
      return true
    }

    // Les gestionnaires de département peuvent modifier les lieux de leur département
    if (
      utilisateur instanceof GestionnaireDepartement &&
      lieu.codeDepartement !== undefined &&
      lieu.codeDepartement === utilisateur.state.departement.code
    ) {
      return true
    }

    if (utilisateur instanceof GestionnaireStructure) {
      // Les gestionnaires de structure peuvent modifier les lieux de leur structure
      if (lieu.estDeLaStructureDuDemandeur) {
        return true
      }

      // Une structure co-porteuse d'une gouvernance a les droits d'un gestionnaire de ce département
      if (lieu.codeDepartement !== undefined && departementsCoportes.includes(lieu.codeDepartement)) {
        return true
      }
    }

    return false
  }
}

// Ce que le contrôle des droits connaît du lieu : sa localisation et, pour un gestionnaire de
// structure, s'il est un lieu de sa structure (calculé en base, cf. PrismaLieuxDeLaStructureLoader).
type LieuAModifier = Readonly<{
  codeDepartement?: string
  codeRegion?: string
  estDeLaStructureDuDemandeur: boolean
}>
