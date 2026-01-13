import Link from 'next/link'
import { ReactElement } from 'react'

import Badge from '@/components/shared/Badge/Badge'
import Table from '@/components/shared/Table/Table'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function StructureRole({ role }: Props): ReactElement {
  return (
    <section
      aria-labelledby="role"
      className="grey-border border-radius fr-mb-2w fr-p-4w"
    >
      <header className="separator fr-mb-2w">
        <h2
          className="fr-h6 fr-mb-2w"
          id="role"
        >
          Rôle
        </h2>
      </header>
      {role.gouvernances.length > 0 ? (
        <Table
          enTetes={['Gouvernance', 'Rôle dans la gouvernance']}
          titre="Rôle de la structure dans les gouvernances"
        >
          {role.gouvernances.map((gouvernance) => (
            <tr key={gouvernance.code}>
              <td>
                <Link href={`/gouvernance/${gouvernance.code}`}>
                  <strong>
                    {gouvernance.nom}
                    {' '}
                    (
                    {gouvernance.code}
                    )
                  </strong>
                </Link>
              </td>
              <td>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {gouvernance.roles.map((roleItem) => (
                    <Badge
                      color={roleItem.color}
                      key={roleItem.nom}
                    >
                      {roleItem.nom}
                    </Badge>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <p className="color-grey">
          Aucune gouvernance
        </p>
      )}
    </section>
  )
}

type Props = Readonly<{
  role: StructureViewModel['role']
}>
