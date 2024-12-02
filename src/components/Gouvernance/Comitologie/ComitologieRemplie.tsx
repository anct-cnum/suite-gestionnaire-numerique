import { ReactElement } from 'react'

import Table from '../../shared/Table/Table'
import SectionRemplie from '../SectionRemplie'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function ComitologieRemplie({ comites }: ComitologieRemplieProps): ReactElement {
  return (
    <SectionRemplie
      button={(
        <button
          className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-add-line"
          type="button"
        >
          Ajouter
        </button>
      )}
      id="comitologie"
      title="Comitologie"
    >
      <Table
        enTetes={['Logo', 'Nom et date du prochain comité', 'Périodicité']}
        hideHead="fr-sr-only"
        titre="Comités"
      >
        {
          comites.map((comite) => {
            return (
              <tr key={comite.nom}>
                <td>
                  <span
                    aria-hidden="true"
                    className="fr-icon-calendar-event-line color-blue-france"
                  />
                </td>
                <td className="font-weight-700">
                  {`${comite.nom} : ${comite.dateProchainComite}`}
                </td>
                <td className="color-grey">
                  {comite.periodicite}
                </td>
              </tr>
            )
          })
        }
      </Table>
    </SectionRemplie>
  )
}

type ComitologieRemplieProps = Readonly<{
  comites: NonNullable<GouvernanceViewModel['comites']>
}>
