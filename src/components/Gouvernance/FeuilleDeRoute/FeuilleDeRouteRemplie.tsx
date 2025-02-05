'use client'

import { ReactElement, useId, useState } from 'react'

import DetailsFeuilleDeRoute from './DetailsFeuilleDeRoute'
import Drawer from '@/components/shared/Drawer/Drawer'
import Table from '@/components/shared/Table/Table'
import { FeuilleDeRouteViewModel, GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function FeuilleDeRouteRemplie({
  feuillesDeRoute,
}: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [feuilleDeRoute, setFeuilleDeRoute] = useState<FeuilleDeRouteViewModel>(feuillesDeRoute[0])
  const drawerFeuilleDeRouteId = 'drawerFeuilleDeRouteId'
  const labelFeuilleDeRouteId = useId()

  return (
    <>
      <Table
        enTetes={['Logo', 'Nom', 'Action', 'Budget total']}
        hideHead="fr-sr-only"
        titre="Feuilles de route"
      >
        {
          feuillesDeRoute.map((feuilleDeRoute) => (
            <tr key={feuilleDeRoute.nom}>
              <td>
                <span
                  aria-hidden="true"
                  className="fr-icon-survey-line color-blue-france"
                />
              </td>
              <td className="font-weight-700">
                <button
                  aria-controls={drawerFeuilleDeRouteId}
                  className="primary font-weight-700 fr-px-0 no-hover d-block"
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
                {`${feuilleDeRoute.budgetGlobal} €`}
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
        id={drawerFeuilleDeRouteId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelFeuilleDeRouteId}
      >
        <DetailsFeuilleDeRoute
          feuilleDeRoute={feuilleDeRoute}
          labelId={labelFeuilleDeRouteId}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  feuillesDeRoute: NonNullable<GouvernanceViewModel['sectionFeuillesDeRoute']['feuillesDeRoute']>
}>
