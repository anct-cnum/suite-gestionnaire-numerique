import Link from 'next/link'
import { ReactElement } from 'react'

import Table from '../../shared/Table/Table'
import SectionRemplie from '../SectionRemplie'
import SubSectionTitle from '../SubSectionTitle'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function FeuilleDeRouteRemplie({
  feuillesDeRoute,
  budgetTotalCumule,
  nombreDeFeuillesDeRoute,
}: FeuilleDeRouteRemplieProps): ReactElement {
  return (
    <SectionRemplie
      button={(
        <Link
          className="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line"
          href="/"
        >
          Gérer
        </Link>
      )}
      id="feuilleDeRoute"
      subTitle={
        <SubSectionTitle>
          {`${nombreDeFeuillesDeRoute}, ${budgetTotalCumule} €`}
        </SubSectionTitle>
      }
      title={nombreDeFeuillesDeRoute}
    >
      <Table
        enTetes={['Logo', 'Nom', 'Action', 'Budget total']}
        hideHead="fr-sr-only"
        titre="Feuilles de route"
      >
        {
          feuillesDeRoute.map((feuilleDeRoute) => {
            return (
              <tr key={feuilleDeRoute.nom}>
                <td>
                  <span
                    aria-hidden="true"
                    className="fr-icon-survey-line color-blue-france"
                  />
                </td>
                <td className="font-weight-700">
                  {feuilleDeRoute.nom}
                </td>
                <td className="color-grey">
                  {feuilleDeRoute.totalActions}
                </td>
                <td className="font-weight-700">
                  {`${feuilleDeRoute.budgetGlobal} €`}
                </td>
              </tr>
            )
          })
        }
      </Table>
    </SectionRemplie>
  )
}

type FeuilleDeRouteRemplieProps = Readonly<{
  feuillesDeRoute: NonNullable<GouvernanceViewModel['sectionFeuillesDeRoute']['feuillesDeRoute']>
  budgetTotalCumule: string
  nombreDeFeuillesDeRoute: string
}>
