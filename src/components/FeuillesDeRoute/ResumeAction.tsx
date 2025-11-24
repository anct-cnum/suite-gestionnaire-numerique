'use client'

import { ReactElement, useId, useState } from 'react'

import DetailAction from './DetailAction'
import Badge from '../shared/Badge/Badge'
import Drawer from '../shared/Drawer/Drawer'
import Tag from '../shared/Tag/Tag'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { FeuilleDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function ResumeAction({ actions, hideStatut = false, uidFeuilleDeRoute }: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
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
                  {hideStatut ? 
                    action.porteurs.length > 0 && (
                      <p
                        className="fr-text--sm fr-mb-0"
                        style={{ color: '#666666' }}
                      >
                        Coporteur de l&apos;action :
                        {' '}
                        {action.porteurs.map((porteur) => porteur.label).join(', ')}
                      </p>
                    )
                    :
                    action.porteurs.map((porteur) => (
                      <Tag
                        href={porteur.link}
                        key={porteur.link}
                      >
                        {porteur.label}
                      </Tag>
                    ))}
                </div>
              </div>
              <div className="fr-col-auto" >
                {!hideStatut && action.statut.display ?
                  <Badge color={action.statut.variant}>
                    {action.statut.libelle}
                  </Badge> : null}
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
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
      >
        <DetailAction
          action={action}
          labelId={labelId}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  actions: FeuilleDeRouteViewModel['actions']
  hideStatut?: boolean
  uidFeuilleDeRoute: string
}>
