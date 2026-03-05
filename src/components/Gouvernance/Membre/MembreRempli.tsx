import Link from 'next/link'
import { Fragment, ReactElement } from 'react'

import styles from './MembreRempli.module.css'
import Badge from '@/components/shared/Badge/Badge'
import Icon from '@/components/shared/Icon/Icon'
import Table from '@/components/shared/Table/Table'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function MembreRempli({ coporteurs }: Props): ReactElement {
  return (
    <div className={styles.responsiveTable}>
      <Table
        enTetes={['Logo', 'Nom', 'Type', 'Rôle']}
        isHeadHidden={true}
        titre="Membres"
      >
        {
          coporteurs.map((membre) => {
            const rolesAffiches = membre.roles.filter(role => role.nom !== 'Observateur')
            return (
              <tr key={`${membre.nom}_${membre.type}`} >
                <td className="color-blue-france">
                  <Icon icon={membre.logo} />
                </td>
                <td>
                  <Link
                    className="primary font-weight-700 fr-px-0 no-hover"
                    href={membre.plusDetailsHref ?? '/'}
                    style={{
                      display: 'block',
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {membre.nom}
                  </Link>
                </td>
                <td className="color-grey">
                  {membre.type}
                </td>
                <td>
                  {rolesAffiches.length > 0 && rolesAffiches.map((role) => (
                    <Fragment key={role.nom}>
                      <Badge color={role.color}>
                        {role.nom}
                      </Badge>
                      {' '}
                    </Fragment>
                  ))}
                </td>
              </tr>
            )
          })
        }
      </Table>
    </div>
  )
}

type Props = Readonly<{
  coporteurs: NonNullable<GouvernanceViewModel['sectionMembres']['coporteurs']>
}>
