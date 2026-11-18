import { ReactElement } from 'react'

import EnTeteSimple from '@/components/transverse/EnTeteSimple/EnTeteSimple'
import Erreur403 from '@/components/transverse/Erreur403/Erreur403'
import LienEvitement, { menuEnTeteSimple } from '@/components/transverse/LienEvitement/LienEvitement'

export default function ErrorPageController(): ReactElement {
  return (
    <>
      <LienEvitement menu={menuEnTeteSimple} />
      <EnTeteSimple />
      <div id="content">
        <Erreur403 lienRetour={{ href: '/connexion', label: 'Retour à la connexion' }} />
      </div>
    </>
  )
}
