'use client'

import { ReactElement, useEffect, useId, useRef, useState } from 'react'

import styles from '@/components/Action/Action.module.css'
import { filtrerDetails, getInfosFilrer } from '@/components/Gouvernances/GouvernanceFiltrage'
import Checkbox from '@/components/shared/Checkbox/Checkbox'
import Drawer from '@/components/shared/Drawer/Drawer'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'
import { GouvernancesViewModel } from '@/presenters/gouvernancesPresenter'
import GouvernanceListFiltre from '@/components/Gouvernances/GouvernanceListFiltre'
import GouvernancesDetails from '@/components/Gouvernances/GouvernancesDetails'
import GouvernancesInfos from '@/components/Gouvernances/GouvernancesInfos'
import GouvernancesHearder from '@/components/Gouvernances/GouvernancesHeader'

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

  function handleFilterClick(): void {
    setIsDrawerOpen(true)
  }

  function onFilter(filtreGeographique: string, filterAvance: FilterType ): void {
    setFiltreGeographique(filtreGeographique)
    setFilterAvance(filterAvance)
    setDetailsFiltrer(filtrerDetails(details, filtreGeographique, filterAvance))
    setIsDrawerOpen(false)
  }

  function onReset(): void {
    setInfosFiltrer(getInfosFilrer(details))
    setDetailsFiltrer(details)
    setIsDrawerOpen(false)
  }

  function onCloseSidePanel(): void {
    setIsDrawerOpen(false)
  }

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerId = 'drawerAjouterDesBesoinsId'
  const labelId = useId()
  const fieldset = useRef<HTMLFieldSetElement>(null)
  const hasBesoins = true
  const resetToutEffacer = (bla) => {}

  return (
    <>
      <button
        aria-controls={drawerId}
        className={
          hasBesoins ?
            'fr-btn fr-btn--tertiary' :
            'fr-btn fr-btn--primary fr-btn--icon-left fr-fi-add-line'
        }
        data-fr-opened="false"
        onClick={() => {
          setIsDrawerOpen(true)
        }}
        title={hasBesoins ? 'Modifier les besoins' : 'Ajouter des besoins'}
        type="button"
      >
        {hasBesoins ? 'Modifier' : 'Ajouter'}
      </button>
      <GouvernancesHearder
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
          console.log("Click sur gouverance list")
          setIsDrawerOpen(true)
        }}
      />
      <GouvernancesInfos infos={infosFiltrer} />
      <GouvernancesDetails details={detailsFiltrer} />

      <Drawer
        boutonFermeture={hasBesoins ? 'Fermer la modification des besoins' : 'Fermer l‘ajout des besoins'}
        closeDrawer={() => {
          resetToutEffacer(fieldset)
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
            background="purple"
            icon="flashlight-line"
          />
          <br />
          Ajouter le(s) besoin(s)
        </DrawerTitle>
        <GouvernanceListFiltre
          details={details}
          filterAvance={filterAvance}
          filtreGeographique={filtreGeographique}
          onFilter={onFilter}
          onReset={onReset}
        />

      </Drawer>
    </>
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

