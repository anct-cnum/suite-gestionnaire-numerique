import { Contexte } from '@/use-cases/queries/ResoudreContexte'

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

export function blocsParContexte(contexte: Contexte): ReadonlyArray<IdentifiantBloc> {
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
