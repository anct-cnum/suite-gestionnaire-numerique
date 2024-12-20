import { ReactElement } from 'react'

import Badge from '@/components/shared/Badge/Badge'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import Tag from '@/components/shared/Tag/Tag'
import { MembreDetailsViewModel } from '@/presenters/gouvernancePresenter'

export default function Membre({ membreDetails, labelId }: Props): ReactElement {
  return (
    <>
      <DrawerTitle id={labelId}>
        {membreDetails.nom}
      </DrawerTitle>
      <div className="fr-mb-2w">
        <ul className="fr-tags-group">
          {membreDetails.roles.map((role) => (
            <li key={role.nom}>
              <Badge
                color={role.color}
              >
                {role.nom}
              </Badge>

            </li>
          ))}
          <li className="color-grey">
            {membreDetails.typologieMembre}
          </li>
        </ul>
      </div>
      <div className="fr-mb-2w">
        <p className="color-grey">
          {membreDetails.sectionFeuilleDeRoute}
        </p>
        { membreDetails.feuillesDeRoute && membreDetails.feuillesDeRoute.length >= 1 ?
          <ul className="fr-tags-group">
            { membreDetails.feuillesDeRoute.map((feuilleDeRoute) => (
              <li key={feuilleDeRoute.nom}>
                <Tag>
                  {feuilleDeRoute.nom}
                </Tag>
              </li>
            ))}
          </ul> : '-'}
      </div>
      <div className="fr-mb-2w">
        <p className="color-grey">
          Contact politique de la collectivité
        </p>
        <p className="font-weight-700">
          {membreDetails.contactPolitique}
        </p>
      </div>
      <div className="fr-mb-2w">
        <p className="color-grey">
          Contact technique
        </p>
        <p className="font-weight-700">
          {membreDetails.contactTechnique}
        </p>
      </div>
      <div className="fr-mb-2w">
        <p className="color-grey">
          Téléphone
        </p>
        <p className="font-weight-700">
          {membreDetails.telephone}
        </p>
      </div>
    </>
  )
}

type Props = Readonly<{
  membreDetails: MembreDetailsViewModel
  labelId: string
}>
