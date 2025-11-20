'use client'

import { ReactElement } from 'react'

import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import CarteFragiliteDepartement from '@/components/TableauDeBord/EtatDesLieux/CarteFragiliteDepartement'
import CarteIndicesFrance from '@/components/TableauDeBord/EtatDesLieux/CarteIndicesFrance'
import {
  CommuneFragilite,
  DepartementFragilite,
} from '@/presenters/tableauDeBord/indicesPresenter'

export default function CarteIndicesFragilite({
  codeDepartement,
  indicesFragilite,
  niveau,
}: Props): ReactElement {
  if (niveau === 'national') {
    return (
      <CarteIndicesFrance
        departementsFragilite={indicesFragilite as Array<DepartementFragilite> | ErrorViewModel}
      />
    )
  }

  return (
    <CarteFragiliteDepartement
      communesFragilite={indicesFragilite as Array<CommuneFragilite> | ErrorViewModel}
      departement={codeDepartement}
    />
  )
}

type Props = Readonly<{
  codeDepartement: string
  indicesFragilite: Array<CommuneFragilite> | Array<DepartementFragilite> | ErrorViewModel
  niveau: 'departement' | 'national'
}>
