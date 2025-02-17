'use client'

import { Fragment, ReactElement, useId, useState } from 'react'

import Membre from './Membre'
import Badge from '@/components/shared/Badge/Badge'
import Drawer from '@/components/shared/Drawer/Drawer'
import Table from '@/components/shared/Table/Table'
import { MembreDetailsViewModel, GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function MembreRempli({ coporteurs }: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [membreDetails, setMembreDetails] = useState<MembreDetailsViewModel>(coporteurs[0])
  const drawerMembreId = 'drawerMembreId'
  const labelMembreId = useId()

  return (
    <>
      <Table
        enTetes={['Logo', 'Nom', 'Type', 'Rôle']}
        hideHead="fr-sr-only"
        titre="Membres"
      >
        {
          coporteurs.map((membre) => (
            <tr key={`${membre.nom}_${membre.type}`} >
              <td>
                <span
                  aria-hidden="true"
                  className={`fr-icon-${membre.logo} color-blue-france`}
                />
              </td>
              <td>
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
      <Drawer
        boutonFermeture={`Fermer les détails du membre : ${membreDetails.nom}`}
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerMembreId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelMembreId}
      >
        <Membre
          details={membreDetails.details}
          labelId={labelMembreId}
          membreDetails={membreDetails}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  coporteurs: NonNullable<GouvernanceViewModel['sectionMembres']['coporteurs']>
}>
