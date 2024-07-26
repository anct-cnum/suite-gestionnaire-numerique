import { Metadata } from 'next'
import { ReactElement } from 'react'

import SelecteurRole from '@/components/shared/SelecteurRole/SelecteurRole'

const title = 'Se connecter'
export const metadata: Metadata = {
  title,
}

export default function PageConnexion(): ReactElement {
  return (
    <SelecteurRole />
  )
}
