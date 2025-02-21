import { ReactElement, useId, useRef, useState } from 'react'

import ModifierUnComite from './ModifierUnComite'
import Drawer from '@/components/shared/Drawer/Drawer'
import Table from '@/components/shared/Table/Table'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function ComitologieRemplie({ comites, dateAujourdhui, uidGouvernance }: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [comite, setComite] = useState(comites[0])
  const drawerRef = useRef<HTMLDialogElement>(null)
  const drawerId = 'drawerModifierComiteId'
  const labelId = useId()

  return (
    <>
      <Table
        enTetes={['Logo', 'Nom et date du prochain comité', 'Périodicité']}
        hideHead="fr-sr-only"
        titre="Comités"
      >
        {
          comites.map((comite) => (
            <tr key={comite.uid}>
              <td>
                <span
                  aria-hidden="true"
                  className="fr-icon-calendar-event-line color-blue-france"
                />
              </td>
              <td className="font-weight-700">
                <button
                  aria-controls={drawerId}
                  className="primary font-weight-700 fr-px-0 no-hover"
                  data-fr-opened="false"
                  onClick={() => {
                    // Stryker disable next-line OptionalChaining
                    // @ts-expect-error
                    drawerRef.current?.querySelector('form').reset()
                    setComite(comite)
                    setIsDrawerOpen(true)
                  }}
                  type="button"
                >
                  {comite.intitule}
                </button>
              </td>
              <td className="color-grey">
                {comite.frequence}
              </td>
            </tr>
          ))
        }
      </Table>
      <Drawer
        boutonFermeture={`Fermer la modification du ${comite.intitule}`}
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
        ref={drawerRef}
      >
        <ModifierUnComite
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          comite={comite}
          dateAujourdhui={dateAujourdhui}
          id={drawerId}
          label={`Détail du ${comite.intitule}`}
          labelId={labelId}
          uidGouvernance={uidGouvernance}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  comites: NonNullable<GouvernanceViewModel['comites']>
  dateAujourdhui: string
  uidGouvernance: string
}>
