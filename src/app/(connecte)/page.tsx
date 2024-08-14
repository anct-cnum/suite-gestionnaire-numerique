import { Metadata } from 'next'
import { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Suite gestionnaire numérique',
}

export default function AccueilController(): ReactElement {
  return (
    <>
      Accueil
    </>
  )
}
