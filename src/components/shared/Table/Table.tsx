import { PropsWithChildren, ReactElement } from 'react'

import styles from './Table.module.css'

export default function Table({
  children,
  enTetes,
  isHeadHidden = false,
  titre,
}: Props): ReactElement {
  return (
    <div
      className="fr-table--md  fr-table fr-table"
      id="table-sm-component"
    >
      <div className={`fr-table__wrapper ${styles['fr-table__wrapper']}`}>
        <div
          className="fr-table__container"
          style={{ margin:0, padding:0 }}
        >
          <div className="fr-table__content">
            <table
              className="fr-table"
              id="table-sm"
              style={{ borderCollapse:'collapse', margin:0, padding:0 }}
            >
              <caption className="fr-sr-only">
                {titre}
              </caption>
              <thead className={isHeadHidden ? 'fr-sr-only' : ''}>
                <tr>
                  {enTetes.map((enTete) => (
                    <th
                      className={`fr-text--xs fr-text-mention--grey ${styles.noBgImage}`}
                      key={enTete}
                      scope="col"
                      style={{ borderBottom: '5px solid var(--border-default-grey)', fontWeight: 500 }}
                    >
                      {
                        enTete === '' ? (
                          <>
                            &nbsp;
                          </>
                        ) : enTete
                      }
                    </th>
                  ))}
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

type Props = PropsWithChildren<Readonly<{
  enTetes: ReadonlyArray<string>
  isHeadHidden?: boolean
  titre: string
}>>
