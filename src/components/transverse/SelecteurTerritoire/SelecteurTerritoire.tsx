'use client'

import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

import RechercheTerritoire from '@/components/shared/Select/RechercheTerritoire'
import { rechercheTerritoiresPresenter, TerritoireViewModel } from '@/presenters/rechercheTerritoiresPresenter'

export default function SelecteurTerritoire({ perimetreLimite, valeurInitiale = null }: Props): ReactElement {
  const router = useRouter()

  return (
    <RechercheTerritoire
      id="selecteurTerritoireTableauDeBord"
      onSelectionner={(territoire) => {
        if (territoire !== null) {
          router.push(`/tableau-de-bord/${territoire.type}/${territoire.code}`)
        }
      }}
      perimetreLimite={perimetreLimite}
      rechercher={rechercherTerritoires}
      valeurInitiale={valeurInitiale}
    />
  )
}

type Props = Readonly<{
  perimetreLimite: boolean
  valeurInitiale?: null | TerritoireViewModel
}>

async function rechercherTerritoires(terme: string): Promise<Parameters<typeof rechercheTerritoiresPresenter>[0]> {
  return fetch(`/api/tableau-de-bord/territoires?q=${encodeURIComponent(terme)}`).then(
    async (reponse) => reponse.json() as Promise<Parameters<typeof rechercheTerritoiresPresenter>[0]>
  )
}
