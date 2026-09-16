import { PropsWithChildren, ReactElement } from 'react'

import Dsfr from '@/app/Dsfr'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'

export default function Layout({ children }: Readonly<PropsWithChildren>): ReactElement {
  return (
    <>
      <main>{children}</main>
      <PiedDePage />
      <Dsfr />
    </>
  )
}
