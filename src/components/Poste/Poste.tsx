'use client'

import { ReactElement } from 'react'

import PosteHeader from './PosteHeader'
import PosteStructureConventionnee from './PosteStructureConventionnee'
import MenuCollant, { type MenuCollantSection } from '../AidantDetails/MenuCollant'
import AlerteConstruction from '@/components/shared/AlerteConstruction/AlerteConstruction'
import ContratsRattaches, {
  type ContratRattacheViewModel,
} from '@/components/shared/ContratsRattaches/ContratsRattaches'
import ConventionsEtFinancements, {
  type ConventionsEtFinancementsViewModel,
} from '@/components/shared/ConventionsEtFinancements/ConventionsEtFinancements'

export default function Poste({ viewModel }: Props): ReactElement {
  return (
    <div className="fr-grid-row">
      <div className="fr-col-3">
        <MenuCollant sections={sections} />
      </div>
      <div className="fr-col-8">
        <PosteHeader
          badges={viewModel.badges}
          posteId={viewModel.posteId}
        />

        <PosteStructureConventionnee structure={viewModel.structure} />
        <AlerteConstruction />
        <ConventionsEtFinancements data={viewModel.conventionsEtFinancements} />

        <ContratsRattaches contrats={viewModel.contrats} />
      </div>
    </div>
  )
}

type PosteViewModel = Readonly<{
  badges: ReadonlyArray<Readonly<{
    color: string
    label: string
  }>>
  contrats: ReadonlyArray<ContratRattacheViewModel>
  conventionsEtFinancements: ConventionsEtFinancementsViewModel
  posteId: number
  structure: Readonly<{
    adresse: string
    departement: string
    nom: string
    referent?: Readonly<{
      email: string
      fonction: string
      nom: string
      telephone: string
    }>
    region: string
    siret: string
    structureId: number
    typologie: string
  }>
}>

type Props = Readonly<{
  viewModel: PosteViewModel
}>

const sections: ReadonlyArray<MenuCollantSection> = [
  {
    id: 'structure-conventionnee',
    label: 'Structure conventionnée',
  },
  {
    id: 'conventions',
    label: 'Convention et financement',
  },
  {
    id: 'contrats',
    label: 'Contrats',
  },
]
