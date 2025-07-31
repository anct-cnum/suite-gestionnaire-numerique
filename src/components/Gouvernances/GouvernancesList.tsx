'use client'

import { ReactElement, useEffect, useId, useState } from 'react'

import { filtrerDetails, getInfosFilrer } from '@/components/Gouvernances/GouvernanceFiltrage'
import GouvernanceListFiltre from '@/components/Gouvernances/GouvernanceListFiltre'
import GouvernancesDetails from '@/components/Gouvernances/GouvernancesDetails'
import GouvernancesHearder from '@/components/Gouvernances/GouvernancesHeader'
import GouvernancesInfos from '@/components/Gouvernances/GouvernancesInfos'
import Drawer from '@/components/shared/Drawer/Drawer'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'
import { GouvernancesViewModel } from '@/presenters/gouvernancesPresenter'

export default function GouvernancesList(props: GouvernancesViewModel): ReactElement {
  const { details } = props
  const [detailsFiltrer, setDetailsFiltrer] = useState(details)
  const [infosFiltrer, setInfosFiltrer] = useState<InfosGouvernances>(() => getInfosFilrer(details))
  // [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [filterAvance, setFilterAvance] = useState<FilterType>(FilterType.NO_FILTRE)
  const [filtreGeographique, setFiltreGeographique] = useState<string>('')

  useEffect(() => {
    const gouvernanceInfo = getInfosFilrer(detailsFiltrer)
    setInfosFiltrer(gouvernanceInfo)
  }, [detailsFiltrer])

  function onFilter(filtreGeographique: string, filterAvance: FilterType ): void {
    setFiltreGeographique(filtreGeographique)
    setFilterAvance(filterAvance)
    setDetailsFiltrer(filtrerDetails(details, filtreGeographique, filterAvance))
    setIsDrawerOpen(false)
  }

  function onReset(): void {
    setFiltreGeographique('')
    setFilterAvance(FilterType.NO_FILTRE)
    setInfosFiltrer(getInfosFilrer(details))
    setDetailsFiltrer(details)
    setIsDrawerOpen(false)
  }

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerId = 'drawerFiltreGouvernances'
  const labelId = useId()

  return (
    <div className="fr-mt-4w">

      <GouvernancesHearder
        drawerId={drawerId}
        filterAvance={{
          libeller: filterAvance,
          onRemove() {
            onFilter(filtreGeographique,FilterType.NO_FILTRE)
          },
          value: filterAvance,
        }}
        filtreGeographique={{
          onRemove() {
            onFilter('',filterAvance)
          },
          value: filtreGeographique,
        }}
        onFilterClick={() => {
          setIsDrawerOpen(true)
        }}
      />
      <GouvernancesInfos infos={infosFiltrer} />
      <GouvernancesDetails details={detailsFiltrer} />
      <Drawer
        boutonFermeture="Fermer le filtre des gouvernances"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
      >
        <DrawerTitle id={labelId}>
          <TitleIcon
            background="blue"
            icon="filter-line"
          />
          <br />
          Filtrer des gouvernances
        </DrawerTitle>
        <GouvernanceListFiltre
          details={details}
          drawerId={drawerId}
          filterAvance={filterAvance}
          filtreGeographique={filtreGeographique}
          onFilterAction={onFilter}
          onResetAction={onReset}
        />

      </Drawer>
    </div>
  )
}

export type InfosGouvernances = {
  creditEngager: {
    creditEngagerGlobal: number
    subventionValiderCompte: number
  }
  feuilleDeRoutes: {
    actionsCompte: number
    feuilleDeRouteCompte: number
  }
  gouvernancesTerritoriales: {
    gouvernanceCoporterCompte: number
    gouvernancesCompte: number
  }
}
export enum FilterType {
  MULTI_ROADMAP = 'Départements avec plus d’une Feuille de route',
  NO_ACTIONS = 'Départements sans actions',
  NO_FILTRE= '',
  NO_GOUV = 'Départements sans gouvernance',
  NO_ROADMAP = 'Départements sans Feuilles de route'
}

