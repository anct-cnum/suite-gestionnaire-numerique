'use client'

import { ReactElement, useId, useState } from 'react'

import AjouterUnMembre from './AjouterUnMembre'
import Drawer from '../shared/Drawer/Drawer'
import PageTitle from '../shared/PageTitle/PageTitle'
import { MesMembresViewModel } from '@/presenters/mesMembresPresenter'

export default function MesMembres({ mesMembresViewModel }: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerId = 'drawerAjouterUnMembre'
  const labelId = useId()

  return (
    <>
      <PageTitle icon="compass-3-line">
        Membres
      </PageTitle>
      <Drawer
        boutonFermeture="Fermer l’ajout d’un membre"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
      >
        <AjouterUnMembre
          candidatsOuSuggeres={mesMembresViewModel.candidatsOuSuggeres}
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          id={drawerId}
          labelId={labelId}
          uidGouvernance={mesMembresViewModel.uidGouvernance}
        />
      </Drawer>
      <button
        aria-controls={drawerId}
        className="fr-btn"
        data-fr-opened="false"
        onClick={() => {
          setIsDrawerOpen(true)
        }}
        type="button"
      >
        Ajouter un membre
      </button>
    </>
  )
}

type Props = Readonly<{
  mesMembresViewModel: MesMembresViewModel
}>
