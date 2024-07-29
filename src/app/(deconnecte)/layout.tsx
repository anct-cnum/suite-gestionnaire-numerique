import { PropsWithChildren, ReactElement } from 'react'

import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'

export default function Layout({ children }: PropsWithChildren): ReactElement {
  return (
    <>
      <main
        className="fr-container fr-pt-3w"
        id="content"
      >
        {children}
      </main>
      <PiedDePage />
    </>
  )
}
