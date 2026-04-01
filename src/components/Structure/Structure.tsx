'use client'

import { ReactElement } from 'react'

import StructureAidantsMediateurs from './StructureAidantsMediateurs'
import StructureContactReferent from './StructureContactReferent'
import StructureContratsRattaches from './StructureContratsRattaches'
import StructureConventions from './StructureConventions'
import StructureHeader from './StructureHeader'
import StructureIdentite from './StructureIdentite'
import StructureRole from './StructureRole'
import MenuCollant, { type SideMenuItem } from '../AidantDetails/MenuCollant'
import styles from '../AidantDetails/MenuCollant.module.css'
import AlerteConstruction from '@/components/shared/AlerteConstruction/AlerteConstruction'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function Structure({ peutGererStructure, viewModel }: Props): ReactElement {
  return (
    <div className={`fr-container fr-py-4w ${styles.fullWidth}`}>
      <div className={styles.layout}>
        <div className={styles.menuContainer}>
          <MenuCollant contentId="structure-content" items={items} />
        </div>
        <div className={styles.contentContainer} id="structure-content">
          <StructureHeader gouvernances={viewModel.role.gouvernances} identite={viewModel.identite} />

          <StructureIdentite identite={viewModel.identite} />

          <StructureContactReferent
            contacts={viewModel.contacts}
            peutGererStructure={peutGererStructure}
            structureId={viewModel.structureId}
          />

          <StructureRole role={viewModel.role} />
          <AlerteConstruction />
          <StructureConventions conventionsEtFinancements={viewModel.conventionsEtFinancements} />

          <StructureContratsRattaches contratsRattaches={viewModel.contratsRattaches} />

          <StructureAidantsMediateurs aidantsEtMediateurs={viewModel.aidantsEtMediateurs} />
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  peutGererStructure: boolean
  viewModel: StructureViewModel
}>

const items: ReadonlyArray<SideMenuItem> = [
  {
    linkProps: { href: '#identite' },
    text: 'Identité',
  },
  {
    linkProps: { href: '#contact' },
    text: 'Contact',
  },
  {
    linkProps: { href: '#role' },
    text: 'Rôle',
  },
  {
    linkProps: { href: '#conventions' },
    text: 'Convention et financement',
  },
  {
    linkProps: { href: '#aidants' },
    text: 'Aidants et médiateurs',
  },
]
