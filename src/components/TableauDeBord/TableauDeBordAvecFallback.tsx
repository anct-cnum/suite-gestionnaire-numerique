import { ReactElement } from 'react'

import TableauDeBord from './TableauDeBord'
import ErreurDonnees from '../shared/ErreurDonnees/ErreurDonnees'
import { CommuneFragilite } from '@/presenters/indiceFragilitePresenter'
import { TableauDeBordViewModel } from '@/presenters/tableauDeBordPresenter'

export default function TableauDeBordAvecFallback({ 
  erreurs = [],
  indicesFragilite,
  tableauDeBordViewModel,
}: Props): ReactElement {
  // Si on a des erreurs, on les affiche en haut
  const erreursElements = erreurs.map((erreur, index) => (
    <ErreurDonnees 
      key={index}
      message={erreur} 
    />
  ))

  return (
    <>
      {erreursElements}
      <TableauDeBord 
        indicesFragilite={indicesFragilite}
        tableauDeBordViewModel={tableauDeBordViewModel}
      />
    </>
  )
}

type Props = Readonly<{
  erreurs?: Array<string>
  indicesFragilite: Array<CommuneFragilite>
  tableauDeBordViewModel: TableauDeBordViewModel
}> 