import Link from 'next/link'
import { ReactElement } from 'react'

import Badge from '@/components/shared/Badge/Badge'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import Tag from '@/components/shared/Tag/Tag'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'
import { MembreDetailsViewModel } from '@/presenters/gouvernancePresenter'

export default function Membre({
  details,
  labelId,
  membreDetails,
}: Props): ReactElement {
  return (
    <>
      <DrawerTitle id={labelId}>
        <TitleIcon icon={membreDetails.logo} />
        <br />
        {membreDetails.nom}
      </DrawerTitle>
      <div className="fr-mb-2w">
        <ul className="fr-tags-group">
          {membreDetails.roles
            .filter(role => role.nom !== 'Observateur' )
            .map((role) => (
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
            {membreDetails.type}
          </li>
        </ul>
      </div>
      {details.map((membre) => (
        <div
          className="fr-mb-2w"
          key={membre.intitule}
        >
          <div
            className="color-grey"
          >
            {membre.intitule}
          </div>
          {membre.feuillesDeRoute ? (
            <ul className="fr-tags-group">
              {membre.feuillesDeRoute.map((feuilleDeRoute) => (
                <li key={feuilleDeRoute.label}>
                  <Tag href={feuilleDeRoute.link}>
                    {feuilleDeRoute.label}
                  </Tag>
                </li>
              ))}
            </ul>
          ) : (
            <div className="font-weight-700">
              {membre.information}
            </div>
          )}
        </div>
      ))}
      {membreDetails.plusDetailsHref !== undefined && membreDetails.plusDetailsHref !== '' ? (
        <ul className="fr-btns-group--icon-left fr-btns-group">
          <li>
            <Link
              className="fr-btn fr-btn--secondary"
              href={membreDetails.plusDetailsHref}
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
  details: MembreDetailsViewModel['details']
  labelId: string
  membreDetails: MembreDetailsViewModel
}>
