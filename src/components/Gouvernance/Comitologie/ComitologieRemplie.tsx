'use client'

import { ReactElement, useRef, useState } from 'react'

import SectionRemplie from '../SectionRemplie'
import AjouterUnComite from './AjouterUnComite'
import Drawer from '@/components/shared/Drawer/Drawer'
import Icon from '@/components/shared/Icon/Icon'
import Table from '@/components/shared/Table/Table'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function ComitologieRemplie({ comites, uidGouvernance }: ComitologieRemplieProps): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerComiteId = 'drawer-comite'
  const labelComiteId = 'drawer-comite-titre'
  const drawerRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <Drawer
        boutonFermeture="Fermer"
        icon={<Icon icon="calendar-event-line" />}
        id={drawerComiteId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelComiteId}
        ref={drawerRef}
        setIsOpen={setIsDrawerOpen}
      >
        <AjouterUnComite
          dialogRef={drawerRef}
          labelId={labelComiteId}
          setIsOpen={setIsDrawerOpen}
          uidGouvernance={uidGouvernance}
        />
      </Drawer>
      <SectionRemplie
        button={(
          <button
            aria-controls={drawerComiteId}
            className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-add-line"
            data-fr-opened="false"
            onClick={() => {
              setIsDrawerOpen(true)
            }}
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
            comites.map(({ nom, dateProchainComite, periodicite }) => (
              <tr key={nom}>
                <td>
                  <span
                    aria-hidden="true"
                    className="fr-icon-calendar-event-line color-blue-france"
                  />
                </td>
                <td className="font-weight-700">
                  {`${nom} : ${dateProchainComite}`}
                </td>
                <td className="color-grey">
                  {periodicite}
                </td>
              </tr>
            ))
          }
        </Table>
      </SectionRemplie>
    </>
  )
}

type ComitologieRemplieProps = Readonly<{
  comites: NonNullable<GouvernanceViewModel['comites']>
  uidGouvernance: string
}>
