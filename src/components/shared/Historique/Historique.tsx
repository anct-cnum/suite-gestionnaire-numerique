import { ReactElement } from 'react'

import Table from '../Table/Table'
import { HistoriqueViewModel } from '@/presenters/shared/historique'

export default function Historique({ historique, sousTitre, titre }: Props): ReactElement {
  return (
    <>
      <header>
        <h2
          className="fr-h6 fr-m-0"
          id="historique"
        >
          {titre}
        </h2>
        <p className="fr-text--sm color-grey fr-m-0">
          {sousTitre}
        </p>
      </header>
      <Table
        enTetes={['Date', 'Activité', 'Éditeur']}
        // Stryker disable next-line BooleanLiteral
        isHeadHidden={true}
        titre={titre}
      >
        {historique.map((historique, index) => (
          <tr
            data-row-key={index}
            id={`table-sm-row-key-${index}`}
            key={historique.libelle}
          >
            <td className="color-grey">
              {historique.date}
            </td>
            <td className="font-weight-700">
              {historique.libelle}
            </td>
            <td className="color-grey">
              {historique.editeur}
            </td>
          </tr>
        ))}
      </Table>
    </>
  )
}

type Props = Readonly<{
  historique: ReadonlyArray<HistoriqueViewModel>
  sousTitre: string
  titre: string
}>
