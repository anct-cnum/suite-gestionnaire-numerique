import Link from 'next/link'
import { Fragment, ReactElement } from 'react'

import Table from '../../shared/Table/Table'
import SectionRemplie from '../SectionRemplie'
import SubSectionTitle from '../SubSectionTitle'
import Badge from '@/components/shared/Badge/Badge'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function MembreRempli({
  detailDuNombreDeChaqueMembre,
  membres,
  nombreDeMembres,
}: MembreRempliProps): ReactElement {
  return (
    <SectionRemplie
      button={(
        <Link
          className="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line"
          href="/"
        >
          Gérer
        </Link>
      )}
      id="membre"
      subTitle={
        <SubSectionTitle>
          {detailDuNombreDeChaqueMembre}
        </SubSectionTitle>
      }
      title={nombreDeMembres}
    >
      <Table
        enTetes={['Logo', 'Nom', 'Type', 'Rôle']}
        hideHead="fr-sr-only"
        titre="Membres"
      >
        {
          membres.map((membre) => (
            <tr key={membre.nom}>
              <td>
                <span
                  aria-hidden="true"
                  className={`fr-icon-${membre.logo} color-blue-france`}
                />
              </td>
              <td className="font-weight-700">
                {membre.nom}
              </td>
              <td className="color-grey">
                {membre.type}
              </td>
              <td>
                {membre.roles.map((role) => (
                  <Fragment key={role.nom}>
                    <Badge color={role.color}>
                      {role.nom}
                    </Badge>
                    {' '}
                  </Fragment>
                ))}
              </td>
            </tr>
          ))
        }
      </Table>
    </SectionRemplie>
  )
}

type MembreRempliProps = Readonly<{
  detailDuNombreDeChaqueMembre: string
  membres: NonNullable<GouvernanceViewModel['sectionMembres']['membres']>
  nombreDeMembres: string
}>
