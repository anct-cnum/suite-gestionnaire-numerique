'use client'

import { ReactElement, useId, useState } from 'react'

import DetailActionVitrine from './DetailActionVitrine'
import Drawer from '../../shared/Drawer/Drawer'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { FeuilleDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function ResumeActionVitrine({ actions, uidFeuilleDeRoute }: Props): ReactElement {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [action, setAction] = useState<FeuilleDeRouteViewModel['actions'][number]>(actions[0])
  const drawerId = `drawerActionId${uidFeuilleDeRoute}`
  const labelId = useId()

  return (
    <>
      <ul aria-label="actions">
        {actions.map((action) => (
          <li key={action.uid}>
            <div
              className="fr-grid-row fr-grid-row--middle space-between"
              style={{ alignItems: 'flex-start' }}
            >
              <div className="fr-col-auto">
                <div style={{ alignItems: 'flex-start', display: 'flex', minHeight: '100%' }}>
                  <TitleIcon
                    background={action.statut.background}
                    icon={action.statut.icon}
                  />
                </div>
              </div>
              <div className="fr-col">
                <div>
                  <button
                    aria-controls={drawerId}
                    className="fr-text--bold color-blue-france fr-mb-1w fr-text--justify"
                    data-fr-opened="false"
                    onClick={() => {
                      setAction(action)
                      setIsDrawerOpen(true)
                    }}
                    style={{ textAlign: 'justify' }}
                    type="button"
                  >
                    {action.nom}
                  </button>
                </div>
                <div>
                  {action.porteurs.length > 0 && (
                    <p
                      className="fr-text--sm fr-mb-0"
                      style={{ color: '#666666' }}
                    >
                      Coporteur de l&apos;action :
                      {' '}
                      {action.porteurs.map((porteur) => porteur.label).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <hr className="fr-mt-2w" />
          </li>
        ))}
      </ul>
      <Drawer
        boutonFermeture={`Fermer le détail de ${action.nom}`}
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerId}
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
      >
        <DetailActionVitrine
          action={action}
          labelId={labelId}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  actions: FeuilleDeRouteViewModel['actions']
  uidFeuilleDeRoute: string
}>
