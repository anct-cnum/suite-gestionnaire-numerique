import { Fragment, ReactElement } from 'react'

import Badge from '@/components/shared/Badge/Badge'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function StructureHeader({ gouvernances, identite }: Props): ReactElement {
  // Extraire tous les rôles uniques de toutes les gouvernances
  const rolesUniques = Array.from(
    new Map(
      gouvernances.flatMap((gouvernance) => gouvernance.roles).map((role) => [role.nom, role])
    ).values()
  )

  return (
    <div className="fr-mt-4w">
      <title >
        {identite.nom}
      </title>

      <div >
        <div className="fr-grid-row space-between fr-mb-2w">
          <h1 className="fr-h1 fr-mb-0 color-blue-france">
            {identite.nom}
          </h1>
        </div>
        <div className="fr-grid-row space-between">
          <div>
            {rolesUniques.map((role) => (
              <Fragment key={role.nom}>
                <Badge color={role.color}>
                  {role.nom}
                </Badge>
                {' '}
              </Fragment>
            ))}
          </div>
          <p className="fr-text--sm color-grey">
            Modifiée le
            {' '}
            {identite.edition}
            {' '}
            par
            {' '}
            {identite.editeur}
          </p>
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  gouvernances: StructureViewModel['role']['gouvernances']
  identite: StructureViewModel['identite']
}>
