'use client'

import { ReactElement } from 'react'

import Icon from '@/components/shared/Icon/Icon'
import Table from '@/components/shared/Table/Table'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function FeuilleDeRouteRemplie({
  feuillesDeRoute,
}: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  return (

    <Table
      enTetes={['Logo', 'Nom', 'Action', 'Budget total']}
      isHeadHidden={true}
      titre="Feuilles de route"
    >
      {
        feuillesDeRoute.map((feuilleDeRoute) => (
          <tr key={feuilleDeRoute.nom}>
            <td className="color-blue-france">
              <Icon icon="survey-line" />
            </td>
            <td className="font-weight-700">
              <button
                className="primary font-weight-700 fr-px-0 no-hover"
                data-fr-opened="false"
                onClick={() => {
                  window.open(feuilleDeRoute.lien, '_blank')
                }}
                type="button"
              >
                {feuilleDeRoute.nom}
              </button>
            </td>
            <td className="color-grey">
              {feuilleDeRoute.totalActions}
            </td>
            <td className="font-weight-700">
              {feuilleDeRoute.budgetGlobal}
            </td>
          </tr>
        ))
      }
    </Table>
  )
}

type Props = Readonly<{
  feuillesDeRoute: NonNullable<GouvernanceViewModel['sectionFeuillesDeRoute']['feuillesDeRoute']>
}>
