'use client'

import { ReactElement, useId, useState } from 'react'

import DetailAction from './DetailAction'
import styles from './FeuillesDeRoute.module.css'
import Badge from '../shared/Badge/Badge'
import Drawer from '../shared/Drawer/Drawer'
import Tag from '../shared/Tag/Tag'
import { ActionViewModel, FeuilleDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function ResumeAction({ actions }: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [action, setAction] = useState<FeuilleDeRouteViewModel['actions'][number]>(actions[0])
  const drawerActionId = 'drawerActionId'
  const labelModifierComiteId = useId()

  return (
    <>
      <ul aria-label="actions">
        {actions.map((action) => (
          <li key={action.uid}>
            <div className="fr-container fr-p-0">
              <div
                className="fr-grid-row"
                style={{ alignItems: 'center' }}
              >
                <div className="fr-col-1">
                  <span
                    aria-hidden="true"
                    className={`${action.statut.icon} ${styles[action.statut.iconStyle]} icon-title fr-mr-3w fr-py-2w`}
                  />
                </div>
                <div className="fr-col-7">
                  <button
                    aria-controls={drawerActionId}
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
                <div
                  className="fr-col-4 right"
                >
                  <Badge color={action.statut.variant}>
                    {action.statut.libelle}
                  </Badge>
                </div>
              </div>
              <hr className="fr-mt-3w" />
            </div>
          </li>
        ))}
      </ul>
      <Drawer
        boutonFermeture={`Fermer le détail de ${action.nom}`}
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerActionId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelModifierComiteId}
      >
        <DetailAction
          action={action}
          labelId={labelModifierComiteId}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  actions: ReadonlyArray<ActionViewModel>
}>
