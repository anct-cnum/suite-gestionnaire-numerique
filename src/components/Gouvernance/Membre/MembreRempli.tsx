'use client'

import Link from 'next/link'
import { Fragment, ReactElement, useState } from 'react'

import SectionRemplie from '../SectionRemplie'
import SubSectionTitle from '../SubSectionTitle'
import DetailsMembre from './DetailsMembre'
import Badge from '@/components/shared/Badge/Badge'
import Drawer from '@/components/shared/Drawer/Drawer'
import Icon from '@/components/shared/Icon/Icon'
import Table from '@/components/shared/Table/Table'
import { MembreViewModel, GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function MembreRempli({
  detailDuNombreDeChaqueMembre,
  membres,
  nombreDeMembres,
}: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [membreDetails, setMembreDetails] = useState<MembreViewModel>(membres[0])
  const drawerMembreId = 'draweMembreId'
  const labelMembreId = 'labelMembreId'
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
        id="membre"
        subTitle={
          <SubSectionTitle>
            {detailDuNombreDeChaqueMembre}
          </SubSectionTitle>
        }
        title={nombreDeMembres}
      >
        <Table
          enTetes={['Logo', 'Nom', 'Type', 'Rôle']}
          hideHead="fr-sr-only"
          titre="Membres"
        >
          {
            membres.map((membre) => (
              <tr key={membre.nom} >
                <td>
                  <span
                    aria-hidden="true"
                    className={`fr-icon-${membre.logo} color-blue-france`}
                  />
                </td>
                <td className="font-weight-700">
                  <button
                    aria-controls={drawerMembreId}
                    className="primary font-weight-700 fr-px-0 no-hover d-block"
                    data-fr-opened="false"
                    onClick={() => {
                      setMembreDetails(membre)
                      setIsDrawerOpen(true)
                    }}
                    type="button"
                  >
                    {membre.nom}
                  </button>
                </td>
                <td className="color-grey">
                  {membre.type}
                </td>
                <td>
                  {membre.roles.map((role) => (
                    <Fragment key={role.nom}>
                      <Badge color={role.color}>
                        {role.nom}
                      </Badge>
                      {' '}
                    </Fragment>
                  ))}
                </td>
              </tr>
            ))
          }
        </Table>
      </SectionRemplie>
      <Drawer
        boutonFermeture={`Fermer les détails du membre : ${membreDetails.nom}`}
        icon={<Icon icon={membreDetails.logo} />}
        id={drawerMembreId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelMembreId}
        setIsOpen={setIsDrawerOpen}
      >
        <DetailsMembre
          labelId={labelMembreId}
          membreDetails={membreDetails}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  detailDuNombreDeChaqueMembre: string
  membres: NonNullable<GouvernanceViewModel['sectionMembres']['membres']>
  nombreDeMembres: string
}>
