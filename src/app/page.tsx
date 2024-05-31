import { Metadata } from 'next'
import { ReactElement } from 'react'

const title = 'Suite gestionnaire numérique'
export const metadata: Metadata = {
  title,
}

export default function Home(): ReactElement {
  return (
    <>
      Accueil
    </>
  )
}
