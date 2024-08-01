import { Metadata } from 'next'
import { ReactElement } from 'react'

import SelecteurRole from '@/components/shared/SelecteurRole/SelecteurRole'

const title = 'Suite gestionnaire numérique'
export const metadata: Metadata = {
  title,
}

export default function Home(): ReactElement {
  return (
    <>
      <SelecteurRole />
      Accueil
    </>
  )
}
