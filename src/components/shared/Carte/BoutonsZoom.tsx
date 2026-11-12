import { ReactElement } from 'react'

import styles from './Map.module.css'

// Boutons de zoom DSFR à la place du NavigationControl de MapLibre : nom français, focus DSFR visible
// (RGAA 7.1, 8.7, 10.7). Ils restent focalisables alors que le canvas de la carte est masqué aux aides techniques.
export default function BoutonsZoom({ onDezoomer, onZoomer }: Props): ReactElement {
  return (
    <div className={`fr-m-1w ${styles.boutonsZoom}`}>
      <button
        className="fr-btn fr-btn--tertiary fr-btn--sm fr-icon-add-line"
        onClick={onZoomer}
        title="Zoomer"
        type="button"
      >
        Zoomer
      </button>
      <button
        className="fr-btn fr-btn--tertiary fr-btn--sm fr-icon-subtract-line"
        onClick={onDezoomer}
        title="Dézoomer"
        type="button"
      >
        Dézoomer
      </button>
    </div>
  )
}

type Props = Readonly<{
  onDezoomer(): void
  onZoomer(): void
}>
