import { PropsWithChildren, ReactElement } from 'react'

import Dsfr from '@/app/Dsfr'
import LienEvitement, { menuPrincipalVitrine } from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import EnTeteVitrine from '@/components/vitrine/EnTeteVitrine/EnTeteVitrine'

export default function VitrineLayout({ children }: Readonly<PropsWithChildren>): ReactElement {
  return (
    <>
      <LienEvitement menu={menuPrincipalVitrine} />
      <EnTeteVitrine />
      <main className="fr-container--fluid" id="content">
        {children}
      </main>
      <PiedDePage vitrine />
      <Dsfr />
    </>
  )
}
