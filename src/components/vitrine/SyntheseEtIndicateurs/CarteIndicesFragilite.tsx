'use client'

import { ReactElement } from 'react'

import { TerritoireCarte } from '@/components/shared/Carte/Carte'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import CarteFragiliteDepartement from '@/components/TableauDeBord/EtatDesLieux/CarteFragiliteDepartement'
import CarteIndicesFrance from '@/components/TableauDeBord/EtatDesLieux/CarteIndicesFrance'
import { CommuneFragilite, DepartementFragilite } from '@/presenters/tableauDeBord/indicesPresenter'

export default function CarteIndicesFragilite({ indicesFragilite, territoire }: Props): ReactElement {
  if (territoire === 'national') {
    return (
      <CarteIndicesFrance departementsFragilite={indicesFragilite as Array<DepartementFragilite> | ErrorViewModel} />
    )
  }

  return <CarteFragiliteDepartement fragilite={indicesFragilite} territoire={territoire} />
}

type Props = Readonly<{
  indicesFragilite: Array<CommuneFragilite> | Array<DepartementFragilite> | ErrorViewModel
  territoire: 'national' | TerritoireCarte
}>
