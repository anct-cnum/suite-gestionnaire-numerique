'use client'

import { ReactElement, useId, useState } from 'react'

import DetailsFeuilleDeRoute from './DetailsFeuilleDeRoute'
import Drawer from '@/components/shared/Drawer/Drawer'
import Icon from '@/components/shared/Icon/Icon'
import Table from '@/components/shared/Table/Table'
import { FeuilleDeRouteViewModel, GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function FeuilleDeRouteRemplie({
  feuillesDeRoute,
}: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [feuilleDeRoute, setFeuilleDeRoute] = useState<FeuilleDeRouteViewModel>(feuillesDeRoute[0])
  const drawerId = 'drawerFeuilleDeRouteId'
  const labelId = useId()

  return (
    <>
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
                  aria-controls={drawerId}
                  className="primary font-weight-700 fr-px-0 no-hover"
                  data-fr-opened="false"
                  onClick={() => {
                    setIsDrawerOpen(true)
                    setFeuilleDeRoute(feuilleDeRoute)
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
      <Drawer
        boutonFermeture="Fermer les détails de la feuille de route"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
      >
        <DetailsFeuilleDeRoute
          feuilleDeRoute={feuilleDeRoute}
          labelId={labelId}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  feuillesDeRoute: NonNullable<GouvernanceViewModel['sectionFeuillesDeRoute']['feuillesDeRoute']>
}>
