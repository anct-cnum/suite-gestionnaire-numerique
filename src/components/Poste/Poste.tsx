'use client'

import { ReactElement } from 'react'

import PosteHeader from './PosteHeader'
import PosteStructureConventionnee from './PosteStructureConventionnee'
import MenuCollant, { type SideMenuItem } from '../AidantDetails/MenuCollant'
import styles from '../AidantDetails/MenuCollant.module.css'
import AlerteConstruction from '@/components/shared/AlerteConstruction/AlerteConstruction'
import ContratsRattaches, {
  type ContratRattacheViewModel,
} from '@/components/shared/ContratsRattaches/ContratsRattaches'
import ConventionsEtFinancements, {
  type ConventionsEtFinancementsViewModel,
} from '@/components/shared/ConventionsEtFinancements/ConventionsEtFinancements'

export default function Poste({ viewModel }: Props): ReactElement {
  return (
    <div className={`fr-container fr-py-4w ${styles.fullWidth}`}>
      <div className={styles.layout}>
        <div className={styles.menuContainer}>
          <MenuCollant
            contentId="poste-content"
            items={items}
          />
        </div>
        <div
          className={styles.contentContainer}
          id="poste-content"
        >
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

const items: ReadonlyArray<SideMenuItem> = [
  {
    linkProps: { href: '#structure-conventionnee' },
    text: 'Structure conventionnée',
  },
  {
    linkProps: { href: '#conventions' },
    text: 'Convention et financement',
  },
  {
    linkProps: { href: '#contrats' },
    text: 'Contrats',
  },
]
