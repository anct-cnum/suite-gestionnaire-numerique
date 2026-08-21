import { Contexte } from '@/use-cases/queries/ResoudreContexte'
import { TerritoireTableauDeBord } from '@/use-cases/queries/shared/TerritoireTableauDeBord'

export type IdentifiantBloc =
  | 'accueil'
  | 'beneficiaires'
  | 'cartographie'
  | 'donneesStructure'
  | 'etatDesLieux'
  | 'financements'
  | 'gouvernance'
  | 'labelConum'
  | 'mediateurs'
  | 'rejoindreGouvernance'
  | 'vigilanceLieux'

// Gouvernance, financements et bénéficiaires n'ont pas de déclinaison à l'EPCI (décision produit).
const blocsSansDeclinaisonEpci: ReadonlyArray<IdentifiantBloc> = ['beneficiaires', 'financements', 'gouvernance']

export function blocsParContexte(
  contexte: Contexte,
  maille: TerritoireTableauDeBord['type']
): ReadonlyArray<IdentifiantBloc> {
  const blocs = blocsDuContexte(contexte)
  if (maille === 'epci') {
    return blocs.filter((bloc) => !blocsSansDeclinaisonEpci.includes(bloc))
  }
  return blocs
}

function blocsDuContexte(contexte: Contexte): ReadonlyArray<IdentifiantBloc> {
  // Points de vigilance des lieux : visible pour tous les rôles, dans le périmètre de chacun (#1488).
  const blocs: Array<IdentifiantBloc> = ['accueil', 'vigilanceLieux']

  if (contexte.aCesRoles('gestionnaire_structure') && contexte.isBetaTesteur) {
    blocs.push('labelConum')
  }

  if (contexte.estGestionnaireStructureSansCoportage()) {
    blocs.push('donneesStructure')
  }

  if (
    contexte.aCesRoles('administrateur_dispositif', 'gestionnaire_departement', 'gestionnaire_region') ||
    contexte.estCoporteur()
  ) {
    blocs.push('etatDesLieux', 'gouvernance')
  }

  if (
    contexte.aCesRoles(
      'administrateur_dispositif',
      'gestionnaire_departement',
      'gestionnaire_region',
      'gestionnaire_structure'
    )
  ) {
    blocs.push('financements')
  }

  if (contexte.aCesRoles('administrateur_dispositif', 'gestionnaire_departement', 'gestionnaire_region')) {
    blocs.push('beneficiaires')
  }

  if (contexte.estGestionnaireStructureHorsGouvernance()) {
    blocs.push('rejoindreGouvernance', 'cartographie')
  }

  return blocs
}
