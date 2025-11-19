'use client'

import { ReactElement } from 'react'

import AlerteConstruction from '@/components/shared/AlerteConstruction/AlerteConstruction'

export default function SyntheseEtIndicateurs(): ReactElement {
  return (
    <>
      <h1 className="fr-h1">
        Synthèse et indicateurs
      </h1>
      <AlerteConstruction />
    </>
  )
}
