import { ReactElement } from 'react'

import SelecteurRangeDates from '@/components/coop/Statistiques/SelecteurRangeDates'

// #2251 : rendu par la page hors du Suspense des statistiques, cet en-tête reste monté pendant leur rechargement :
// le bouton « Période » garde le focus, et le message de statut est mis à jour (RGAA 7.5) au lieu d'être recréé.
export default function EnteteStatistiquesMediateurs({ dateDebut, dateFin, periode }: Props): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--middle fr-grid-row--gutters fr-mt-1w">
      <div className="fr-col">
        <h3 className="fr-h4 color-blue-france fr-mb-0">Données et statistiques</h3>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-0" role="status">
          {periode}
        </p>
      </div>
      <div className="fr-col-auto">
        <SelecteurRangeDates dateDebut={dateDebut} dateFin={dateFin} />
      </div>
    </div>
  )
}

type Props = Readonly<{
  dateDebut: string
  dateFin: string
  periode: string
}>
