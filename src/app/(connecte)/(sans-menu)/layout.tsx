import { PropsWithChildren, ReactElement } from 'react'

import Dsfr from '@/app/Dsfr'

export default function Layout({ children }: Readonly<PropsWithChildren>): ReactElement {
  return (
    <>
      {children}
      <Dsfr />
    </>
  )
}
