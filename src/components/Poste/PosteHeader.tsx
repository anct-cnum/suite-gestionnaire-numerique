import { Fragment, ReactElement } from 'react'

import Badge from '@/components/shared/Badge/Badge'

export default function PosteHeader({ badges, dateMiseAJour, posteId }: Props): ReactElement {
  return (
    <div className="fr-my-4w ">
      <div>
        <div className="fr-grid-row space-between fr-mb-1w">
          <h1 className="fr-h1 fr-mb-0 color-blue-france">Poste #{posteId}</h1>
        </div>
        <div className="fr-grid-row fr-grid-row--middle space-between">
          <div>
            {badges.map((badge) => (
              <Fragment key={badge.label}>
                <Badge color={badge.color}>{badge.label}</Badge>{' '}
              </Fragment>
            ))}
          </div>
          {dateMiseAJour === null ? null : (
            <p className="fr-text--sm fr-text-mention--grey fr-mb-0">Mise à jour le {dateMiseAJour}</p>
          )}
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  badges: ReadonlyArray<
    Readonly<{
      color: string
      label: string
    }>
  >
  dateMiseAJour: null | string
  posteId: number
}>
