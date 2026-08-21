import { PerimetreRechercheTerritoires } from './RechercherTerritoires'
import { Contexte } from './ResoudreContexte'

// Source d'autorité unique du périmètre de recherche territoriale du tableau de bord :
// utilisée par la route API de recherche, l'affichage du sélecteur et le contrôle d'accès des pages.
export function perimetreRechercheDuContexte(contexte: Contexte): null | PerimetreRechercheTerritoires {
  if (contexte.aCesRoles('administrateur_dispositif')) {
    return { type: 'complet' }
  }

  if (contexte.aCesRoles('gestionnaire_departement') || contexte.estCoporteur()) {
    const codesDepartement = contexte.codesDepartements()
    return codesDepartement.length === 0 ? null : { codesDepartement, type: 'departements' }
  }

  // Un gestionnaire de structure hors gouvernance ne voit que les données de sa structure :
  // aucune navigation territoriale, donc pas de périmètre de recherche.
  return null
}
