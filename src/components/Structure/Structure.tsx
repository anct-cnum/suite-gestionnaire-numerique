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
import { RattachementsStructureViewModel } from '@/presenters/rattachementsStructurePresenter'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function Structure({
  editionNomActive,
  peutGererStructure,
  rattachements,
  viewModel,
}: Props): ReactElement {
  return (
    <div className={`fr-container fr-py-4w ${styles.fullWidth}`}>
      <div className={styles.layout}>
        <div className={styles.menuContainer}>
          <MenuCollant contentId="structure-content" items={items} />
        </div>
        <div className={styles.contentContainer} id="structure-content">
          <StructureHeader gouvernances={viewModel.role.gouvernances} identite={viewModel.identite} />

          <StructureIdentite
            editionActive={editionNomActive}
            identite={viewModel.identite}
            rattachements={rattachements}
            structureId={viewModel.structureId}
          />

          <StructureContactReferent
            contacts={viewModel.contacts}
            peutGererStructure={peutGererStructure}
            structureId={viewModel.structureId}
          />

          <StructureRole role={viewModel.role} />
          <StructureConventions conventionsEtFinancements={viewModel.conventionsEtFinancements} />

          <StructureContratsRattaches contratsRattaches={viewModel.contratsRattaches} />

          <StructureAidantsMediateurs aidantsEtMediateurs={viewModel.aidantsEtMediateurs} />
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  editionNomActive: boolean
  peutGererStructure: boolean
  rattachements: RattachementsStructureViewModel
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
    text: 'Conventions et financements',
  },
  {
    linkProps: { href: '#aidants' },
    text: 'Aidants et médiateurs',
  },
]
