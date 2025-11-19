'use client'

import { ReactElement } from 'react'

import AlerteConstruction from '@/components/shared/AlerteConstruction/AlerteConstruction'

export default function FeuilleDeRoute(): ReactElement {
  return (
    <>
      <h1 className="fr-h1">
        Feuille de route
      </h1>
      <AlerteConstruction />
    </>
  )
}
