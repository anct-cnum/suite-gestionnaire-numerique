import Link from 'next/link'
import { ReactElement } from 'react'

import Badge from '@/components/shared/Badge/Badge'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import Tag from '@/components/shared/Tag/Tag'
import { MembreDetailsViewModel } from '@/presenters/gouvernancePresenter'

export default function Membre({
  membreDetails,
  labelId,
  aperçueDuMembre,
  affichagePlusDetails,
}: Props): ReactElement {
  return (
    <>
      <DrawerTitle id={labelId}>
        {membreDetails.nom}
      </DrawerTitle>
      <div className="fr-mb-2w">
        <ul className="fr-tags-group">
          {membreDetails.roles.map((role) => (
            <li
              className="fr-mr-1w"
              key={role.nom}
            >
              <Badge color={role.color}>
                {role.nom}
              </Badge>
            </li>
          ))}
          <li className="color-grey">
            {membreDetails.typologieMembre}
          </li>
        </ul>
      </div>
      {aperçueDuMembre.map((membre) => (
        <div
          className="fr-mb-2w"
          key={membre.aperçueIntitule}
        >
          <div className="color-grey">
            {membre.aperçueIntitule}
          </div>
          {membre.aperçueFeuillesDeRoute ? (
            <ul className="fr-tags-group">
              {membre.aperçueFeuillesDeRoute.map((feuilleDeRoute) => (
                <li key={feuilleDeRoute.nom}>
                  <Tag>
                    {feuilleDeRoute.nom}
                  </Tag>
                </li>
              ))}
            </ul>
          ) : (
            <div className="font-weight-700">
              {membre.aperçueDeLaDonnee}
            </div>
          )}
        </div>
      ))}
      {affichagePlusDetails ? (
        <ul className="fr-btns-group--icon-left fr-btns-group">
          <li>
            <Link
              className="fr-btn fr-btn--secondary"
              href="/"
            >
              Plus de détails
            </Link>
          </li>
        </ul>
      ) : null}
    </>
  )
}

type Props = Readonly<{
  membreDetails: MembreDetailsViewModel
  labelId: string
  aperçueDuMembre: MembreDetailsViewModel['aperçueDuMembre']
  affichagePlusDetails: boolean
}>
