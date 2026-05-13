export function toStatutContratViewModel(statut: StatutContratValeur): StatutContratViewModel {
  if (statut === 'termine') {
    return { libelle: 'Terminé', variant: 'error' }
  }
  return { libelle: 'En cours', variant: 'success' }
}

export type StatutContratViewModel = Readonly<{
  libelle: 'En cours' | 'Terminé'
  variant: 'error' | 'success'
}>

// Doit refléter le type StatutContrat défini dans src/domain/Contrat.ts ;
// la couche presenter n'a pas le droit d'importer du domain.
type StatutContratValeur = 'enCours' | 'termine'
