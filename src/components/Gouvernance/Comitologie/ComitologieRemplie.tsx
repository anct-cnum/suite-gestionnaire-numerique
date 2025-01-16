import { ReactElement } from 'react'

import Table from '@/components/shared/Table/Table'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function ComitologieRemplie({ comites }: Props): ReactElement {
  return (
    <Table
      enTetes={['Logo', 'Nom et date du prochain comité', 'Périodicité']}
      hideHead="fr-sr-only"
      titre="Comités"
    >
      {
        comites.map(({ intitule, periodicite }) => (
          <tr key={intitule}>
            <td>
              <span
                aria-hidden="true"
                className="fr-icon-calendar-event-line color-blue-france"
              />
            </td>
            <td className="font-weight-700">
              {intitule}
            </td>
            <td className="color-grey">
              {periodicite}
            </td>
          </tr>
        ))
      }
    </Table>
  )
}

type Props = Readonly<{
  comites: NonNullable<GouvernanceViewModel['comites']>
}>
