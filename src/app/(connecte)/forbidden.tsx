import { ReactElement } from 'react'

import Erreur403 from '@/components/transverse/Erreur403/Erreur403'

export default function Forbidden(): ReactElement {
  return <Erreur403 lienRetour={{ href: '/tableau-de-bord', label: 'Retour à l\u2019accueil' }} />
}
