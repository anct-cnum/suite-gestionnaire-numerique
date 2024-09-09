import { ReactElement } from 'react'

import Badge from '../../shared/Badge/Badge'
import { StatutInscription } from '@/presenters/mesUtilisateursPresenter'

export default function Statut({ libelle }: StatutProps): ReactElement {
  // Stryker disable next-line all
  const color = libelle === 'Activé' ? 'success' : 'grey-main'

  return (
    <Badge color={color}>
      {libelle}
    </Badge>
  )
}

type StatutProps = Readonly<{
  libelle: StatutInscription
}>
