import { PropsWithChildren, ReactElement } from 'react'

import '@gouvfr/dsfr/dist/core/core.min.css'

import PiedDePage from '@/components/shared/PiedDePage/PiedDePage'

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
