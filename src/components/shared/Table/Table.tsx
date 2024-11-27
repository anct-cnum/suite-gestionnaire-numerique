import { PropsWithChildren, ReactElement } from 'react'

import styles from './Table.module.css'

export default function Table({ children, enTetes, titre, hasHead = true }: TableProps): ReactElement {
  return (
    <div
      className="fr-table--sm fr-table fr-table"
      id="table-sm-component"
    >
      <div className={`fr-table__wrapper ${styles['fr-table__wrapper']}`}>
        <div className="fr-table__container">
          <div className="fr-table__content">
            <table id="table-sm">
              <caption className="fr-sr-only">
                {titre}
              </caption>
              <thead className={hasHead ? '' : 'fr-sr-only'}>
                <tr>
                  {enTetes.map((enTete) => {
                    return (
                      <th
                        key={enTete}
                        scope="col"
                      >
                        {enTete !== '' ? enTete : (
                          <>
                            &nbsp;
                          </>
                        )}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {children}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

type TableProps = PropsWithChildren<Readonly<{
  hasHead?: boolean
  enTetes: ReadonlyArray<string>
  titre: string
}>>
