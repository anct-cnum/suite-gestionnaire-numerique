'use client'

import { ReactElement } from 'react'

import StructureAidantsMediateurs from './StructureAidantsMediateurs'
import StructureContratsRattaches from './StructureContratsRattaches'
import StructureConventions from './StructureConventions'
import StructureHeader from './StructureHeader'
import StructureIdentite from './StructureIdentite'
import StructureRole from './StructureRole'
import MenuCollant, { type MenuCollantSection } from '../AidantDetails/MenuCollant'
import AlerteConstruction from '@/components/shared/AlerteConstruction/AlerteConstruction'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function Structure({ viewModel }: Props): ReactElement {
  return (
    <div className="fr-grid-row">
      <div className="fr-col-3">
        <MenuCollant sections={sections} />
      </div>
      <div className="fr-col-9 ">
        <StructureHeader
          gouvernances={viewModel.role.gouvernances}
          identite={viewModel.identite}
        />

        <StructureIdentite identite={viewModel.identite} />

        {/* <StructureContactReferent
          contactReferent={viewModel.contactReferent}
          structureId={viewModel.structureId}
        /> */}

        <StructureRole role={viewModel.role} />
        <AlerteConstruction />
        <StructureConventions conventionsEtFinancements={viewModel.conventionsEtFinancements} />

        <StructureContratsRattaches contratsRattaches={viewModel.contratsRattaches} />

        <StructureAidantsMediateurs aidantsEtMediateurs={viewModel.aidantsEtMediateurs} />
      </div>
    </div>
  )
}

type Props = Readonly<{
  viewModel: StructureViewModel
}>

const sections: ReadonlyArray<MenuCollantSection> = [
  {
    id: 'identite',
    label: 'Identité',
  },
  // {
  //   id: 'contact',
  //   label: 'Contact référent',
  // },
  {
    id: 'role',
    label: 'Rôle',
  },
  {
    id: 'conventions',
    label: 'Convention et financement',
  },
  {
    id: 'aidants',
    label: 'Aidants et médiateurs',
  },
]
