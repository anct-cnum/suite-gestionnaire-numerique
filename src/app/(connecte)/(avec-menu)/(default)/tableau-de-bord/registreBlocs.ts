import { Contexte } from '@/use-cases/queries/ResoudreContexte'

export type IdentifiantBloc =
  | 'accueil'
  | 'beneficiaires'
  | 'cartographie'
  | 'donneesStructure'
  | 'etatDesLieux'
  | 'financements'
  | 'gouvernance'
  | 'mediateurs'
  | 'rejoindreGouvernance'

export function blocsParContexte(contexte: Contexte): ReadonlyArray<IdentifiantBloc> {
  const estGestionnaireStructure = contexte.aCesRoles('gestionnaire_structure') && !contexte.estDansGouvernance()

  const blocs: Array<IdentifiantBloc> = ['accueil']

  if (estGestionnaireStructure) {
    blocs.push('donneesStructure')
  }

  if (
    contexte.aCesRoles('administrateur_dispositif', 'gestionnaire_departement', 'gestionnaire_region') ||
    contexte.estDansGouvernance()
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

  if (estGestionnaireStructure && !contexte.aCesRoles('administrateur_dispositif', 'gestionnaire_departement')) {
    blocs.push('rejoindreGouvernance', 'cartographie')
  }

  return blocs
}
