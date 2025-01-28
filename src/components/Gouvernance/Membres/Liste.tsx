import { ReactElement } from 'react'

import Badge from '@/components/shared/Badge/Badge'
import Table from '@/components/shared/Table/Table'

export default function Liste({ foo }: { readonly foo: string }): ReactElement {
  return (
    <Table
      enTetes={['Structure', 'Contact référent', 'Rôles', '']}
      titre="Mes utilisateurs"
    >
      <tr
        data-row-key={0}
        id="table-sm-row-key-0"
        key={0}
      >
        <td>
          <div className="font-weight-700">
            {foo}
          </div>
          {foo}
        </td>
        <td>
          {foo}
        </td>
        <td>
          <Badge color="error">
            {foo}
          </Badge>
          <Badge color="grey-main">
            {foo}
          </Badge>
          <Badge color="new">
            {foo}
          </Badge>
          <Badge color="success">
            {foo}
          </Badge>
          <Badge color="info">
            {foo}
          </Badge>
        </td>
        <td className="fr-cell--center">
          <button
            className="fr-btn fr-btn--tertiary"
            disabled={false}
            title="Supprimer"
            type="button"
          >
            <span
              aria-hidden="true"
              className="fr-icon-delete-line color-red"
            />
          </button>
        </td>
      </tr>
      {Array.from(Array(10).keys()).map((index) => (
        <tr
          data-row-key={index}
          id={`table-sm-row-key-${index}`}
          key={index}
        >
          <td>
            <div className="font-weight-700">
              CC des Monts du Lyonnais
            </div>
            Collectivité, EPCI
          </td>
          <td>
            Thierry Ducon
          </td>
          <td>
            <Badge color="error">
              Bénéficiaire
            </Badge>
            <Badge color="grey-main">
              Co-financeur
            </Badge>
            <Badge color="new">
              Observateur
            </Badge>
            <Badge color="success">
              Formation
            </Badge>
            <Badge color="info">
              Co-porteur
            </Badge>
          </td>
          <td className="fr-cell--center">
            <button
              className="fr-btn fr-btn--tertiary"
              disabled={false}
              title="Supprimer"
              type="button"
            >
              <span
                aria-hidden="true"
                className="fr-icon-delete-line color-red"
              />
            </button>
          </td>
        </tr>
      ))}
    </Table>
  )
}
