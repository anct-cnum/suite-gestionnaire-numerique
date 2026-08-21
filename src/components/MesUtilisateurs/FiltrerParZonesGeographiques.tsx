'use client'

import { ReactElement, useId } from 'react'

import RechercheTerritoire from '../shared/Select/RechercheTerritoire'
import { rechercherTerritoires } from '@/components/vitrine/DonneesTerritoriales/rechercherTerritoires'
import { TerritoireViewModel } from '@/presenters/rechercheTerritoiresPresenter'

export default function FiltrerParZonesGeographiques({ onSelectionner, valeurInitiale = null }: Props): ReactElement {
  const id = useId()

  return (
    <RechercheTerritoire
      id={id}
      label="Par zone géographique"
      onSelectionner={onSelectionner}
      rechercher={rechercherTerritoires}
      valeurInitiale={valeurInitiale}
    />
  )
}

type Props = Readonly<{
  onSelectionner(territoire: null | TerritoireViewModel): void
  valeurInitiale?: null | TerritoireViewModel
}>
