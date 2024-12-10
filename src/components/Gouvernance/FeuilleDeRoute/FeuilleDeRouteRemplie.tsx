'use client'

import Link from 'next/link'
import { ReactElement, useState } from 'react'

import SectionRemplie from '../SectionRemplie'
import SubSectionTitle from '../SubSectionTitle'
import DetailsFeuilleDeRoute from './DetailsFeuilleDeRoute'
import Drawer from '@/components/shared/Drawer/Drawer'
import Icon from '@/components/shared/Icon/Icon'
import Table from '@/components/shared/Table/Table'
import { FeuilleDeRouteViewModel, GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function FeuilleDeRouteRemplie({
  feuillesDeRoute,
  budgetTotalCumule,
  nombreDeFeuillesDeRoute,
}: FeuilleDeRouteRemplieProps): ReactElement {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [feuilleDeRoute, setFeuilleDeRoute] = useState<FeuilleDeRouteViewModel>(feuillesDeRoute[0])
  const drawerFeuilleDeRouteId = 'drawerFeuilleDeRouteId'
  const labelFeuilleDeRouteId = 'labelFeuilleDeRouteId'
  return (
    <>
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
      </SectionRemplie>
      <Drawer
        boutonFermeture="Fermer les détails de la feuille de route"
        icon={<Icon icon="survey-line" />}
        id={drawerFeuilleDeRouteId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelFeuilleDeRouteId}
        setIsOpen={setIsDrawerOpen}
      >
        <DetailsFeuilleDeRoute
          feuilleDeRoute={feuilleDeRoute}
          labelId={labelFeuilleDeRouteId}
        />
      </Drawer>
    </>
  )
}

type FeuilleDeRouteRemplieProps = Readonly<{
  feuillesDeRoute: NonNullable<GouvernanceViewModel['sectionFeuillesDeRoute']['feuillesDeRoute']>
  budgetTotalCumule: string
  nombreDeFeuillesDeRoute: string
}>
