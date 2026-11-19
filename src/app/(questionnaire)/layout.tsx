import { PropsWithChildren, ReactElement } from 'react'

import Dsfr from '@/app/Dsfr'

// Questionnaire public de la mesure d'impact : sans session ni habillage de MIN, aux couleurs du territoire.
export default function Layout({ children }: Readonly<PropsWithChildren>): ReactElement {
  return (
    <>
      {children}
      <Dsfr />
    </>
  )
}
