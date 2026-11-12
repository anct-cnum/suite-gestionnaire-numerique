import { ReactElement } from 'react'

import TableauFragilite from './TableauFragilite'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import {
  CommuneFragilite,
  DepartementFragilite,
  lignesTableauFragilite,
} from '@/presenters/tableauDeBord/indicesPresenter'

export default function TableauIndicesFragilite({ fragilite, maille }: Props): ReactElement {
  if ('type' in fragilite) {
    return <p className="fr-text--sm fr-mb-0">{fragilite.message}</p>
  }

  const pluriel = fragilite.length > 1 ? 's' : ''
  return (
    <TableauFragilite
      lignes={lignesTableauFragilite(fragilite)}
      nomColonneTerritoire={maille === 'commune' ? 'Commune' : 'Département'}
      titre={`Indice de fragilité numérique par ${maille} (${fragilite.length} ${maille}${pluriel})`}
    />
  )
}

type Props = Readonly<{
  fragilite: ErrorViewModel | ReadonlyArray<CommuneFragilite | DepartementFragilite>
  maille: 'commune' | 'département'
}>
