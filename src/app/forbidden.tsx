import { ReactElement } from 'react'

import EnTeteSimple from '@/components/transverse/EnTeteSimple/EnTeteSimple'
import Erreur403 from '@/components/transverse/Erreur403/Erreur403'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'

export default function Forbidden(): ReactElement {
  return (
    <>
      <LienEvitement />
      <EnTeteSimple />
      <main className="fr-container--fluid" id="content">
        <Erreur403 lienRetour={{ href: '/tableau-de-bord', label: 'Retour à l\u2019accueil' }} />
      </main>
      <PiedDePage />
    </>
  )
}
