import { ReactElement, useRef, useState } from 'react'

import ModifierUnComite from './ModifierUnComite'
import Drawer from '@/components/shared/Drawer/Drawer'
import Table from '@/components/shared/Table/Table'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function ComitologieRemplie({ comites }: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [comite, setComite] = useState(comites[0])
  const drawerRef = useRef<HTMLDialogElement>(null)
  const drawerModifierComiteId = 'drawerModifierComiteId'
  const labelModifierComiteId = 'labelModifierComiteId'

  return (
    <>
      <Table
        enTetes={['Logo', 'Nom et date du prochain comité', 'Périodicité']}
        hideHead="fr-sr-only"
        titre="Comités"
      >
        {
          comites.map((comite) => (
            <tr key={`${comite.intitule}_${comite.date}`}>
              <td>
                <span
                  aria-hidden="true"
                  className="fr-icon-calendar-event-line color-blue-france"
                />
              </td>
              <td className="font-weight-700">
                <button
                  aria-controls={drawerModifierComiteId}
                  className="primary font-weight-700 fr-px-0 no-hover d-block"
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
        id={drawerModifierComiteId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelModifierComiteId}
        ref={drawerRef}
      >
        <ModifierUnComite
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          comite={comite}
          dialogRef={drawerRef}
          label={`Détail du ${comite.intitule}`}
          labelId={labelModifierComiteId}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  comites: NonNullable<GouvernanceViewModel['comites']>
}>
