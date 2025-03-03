'use client'

import { ReactElement, useId, useState } from 'react'

import DetailAction from './DetailAction'
import Badge from '../shared/Badge/Badge'
import Drawer from '../shared/Drawer/Drawer'
import Tag from '../shared/Tag/Tag'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { FeuilleDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function ResumeAction({ actions }: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [action, setAction] = useState<FeuilleDeRouteViewModel['actions'][number]>(actions[0])
  const drawerId = 'drawerActionId'
  const labelId = useId()

  return (
    <>
      <ul aria-label="actions">
        {actions.map((action) => (
          <li key={action.uid}>
            <div className="fr-grid-row fr-grid-row--middle space-between">
              <div className="fr-grid-row">
                <TitleIcon
                  background={action.statut.background}
                  icon={action.statut.icon}
                />
                <div>
                  <button
                    aria-controls={drawerId}
                    className="fr-text--bold color-blue-france fr-mb-1w"
                    data-fr-opened="false"
                    onClick={() => {
                      setAction(action)
                      setIsDrawerOpen(true)
                    }}
                    type="button"
                  >
                    {action.nom}
                  </button>
                  <br />
                  <Tag>
                    {action.porteur}
                  </Tag>
                </div>
              </div>
              <div className="fr-col-4 right">
                <Badge color={action.statut.variant}>
                  {action.statut.libelle}
                </Badge>
              </div>
            </div>
            <hr className="fr-mt-3w" />
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
}>
