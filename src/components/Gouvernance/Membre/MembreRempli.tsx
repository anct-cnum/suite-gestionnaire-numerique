'use client'

import { Fragment, ReactElement, useId, useState } from 'react'

import Membre from './Membre'
import Badge from '@/components/shared/Badge/Badge'
import Drawer from '@/components/shared/Drawer/Drawer'
import Icon from '@/components/shared/Icon/Icon'
import Table from '@/components/shared/Table/Table'
import { GouvernanceViewModel, MembreDetailsViewModel } from '@/presenters/gouvernancePresenter'

export default function MembreRempli({ coporteurs }: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [membreDetails, setMembreDetails] = useState<MembreDetailsViewModel>(coporteurs[0])
  const drawerId = 'drawerMembreId'
  const labelId = useId()

  return (
    <>
      <Table
        enTetes={['Logo', 'Nom', 'Type', 'Rôle']}
        isHeadHidden={true}
        titre="Membres"
      >
        {
          coporteurs.map((membre) => (
            <tr key={`${membre.nom}_${membre.type}`} >
              <td className="color-blue-france">
                <Icon icon={membre.logo} />
              </td>
              <td>
                <button
                  aria-controls={drawerId}
                  className="primary font-weight-700 fr-px-0 no-hover"
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
                {membre.roles
                  .filter(role => role.nom !== 'Observateur' )
                  .map((role) => (
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
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
      >
        <Membre
          details={membreDetails.details}
          labelId={labelId}
          membreDetails={membreDetails}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  coporteurs: NonNullable<GouvernanceViewModel['sectionMembres']['coporteurs']>
}>
