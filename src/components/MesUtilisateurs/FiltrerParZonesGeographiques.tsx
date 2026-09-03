'use client'

import { ReactElement, useId } from 'react'

import RechercheTerritoire from '../shared/Select/RechercheTerritoire'
import { rechercherTerritoires } from '@/components/vitrine/DonneesTerritoriales/rechercherTerritoires'
import { rechercheTerritoiresPresenter, TerritoireViewModel } from '@/presenters/rechercheTerritoiresPresenter'

export default function FiltrerParZonesGeographiques({
  onSelectionner,
  source = 'complet',
  valeurInitiale = null,
}: Props): ReactElement {
  const id = useId()

  return (
    <RechercheTerritoire
      id={id}
      label="Par zone géographique"
      onSelectionner={onSelectionner}
      rechercher={source === 'complet' ? rechercherTerritoires : rechercherTerritoiresDuPerimetre}
      valeurInitiale={valeurInitiale}
    />
  )
}

type Props = Readonly<{
  onSelectionner(territoire: null | TerritoireViewModel): void
  // 'perimetre' : recherche limitée au périmètre de l'utilisateur, appliqué côté serveur (gestionnaire région).
  source?: 'complet' | 'perimetre'
  valeurInitiale?: null | TerritoireViewModel
}>

async function rechercherTerritoiresDuPerimetre(
  terme: string
): Promise<Parameters<typeof rechercheTerritoiresPresenter>[0]> {
  return fetch(`/api/tableau-de-bord/territoires?q=${encodeURIComponent(terme)}`).then(
    async (reponse) => reponse.json() as Promise<Parameters<typeof rechercheTerritoiresPresenter>[0]>
  )
}
