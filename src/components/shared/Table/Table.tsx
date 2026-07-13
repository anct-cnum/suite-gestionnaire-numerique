import { PropsWithChildren, ReactElement, ReactNode } from 'react'

import styles from './Table.module.css'

// multiline : autorise le retour à la ligne dans les cellules (le DSFR est en nowrap
// par défaut, ce qui peut pousser les dernières colonnes dans une zone de scroll).
export default function Table({
  children,
  enTetes,
  isHeadHidden = false,
  multiline = false,
  titre,
}: Props): ReactElement {
  return (
    <div
      className={`fr-table--md  fr-table fr-table ${multiline ? 'fr-table--multiline' : ''}`}
      id="table-sm-component"
    >
      <div className={`fr-table__wrapper ${styles['fr-table__wrapper']}`}>
        <div className="fr-table__container" style={{ margin: 0, padding: 0 }}>
          <div className="fr-table__content">
            <table className="fr-table" id="table-sm" style={{ borderCollapse: 'collapse', margin: 0, padding: 0 }}>
              <caption className="fr-sr-only">{titre}</caption>
              <thead className={isHeadHidden ? 'fr-sr-only' : ''}>
                <tr>
                  {enTetes.map((enTete) => (
                    <th
                      aria-sort={typeof enTete === 'string' ? undefined : enTete.ariaSort}
                      className={`fr-text--xs fr-text-mention--grey ${styles.noBgImage}`}
                      key={typeof enTete === 'string' ? enTete : enTete.label}
                      scope="col"
                      style={{ borderBottom: '5px solid var(--border-default-grey)', fontWeight: 500 }}
                    >
                      {contenuEnTete(enTete)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{children}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function contenuEnTete(enTete: EnTete): ReactNode {
  if (typeof enTete !== 'string') {
    return enTete.contenu
  }
  return enTete === '' ? <>&nbsp;</> : enTete
}

type EnTete =
  | Readonly<{
      ariaSort?: 'ascending' | 'descending'
      contenu: ReactElement
      label: string
    }>
  | string

type Props = PropsWithChildren<
  Readonly<{
    enTetes: ReadonlyArray<EnTete>
    isHeadHidden?: boolean
    multiline?: boolean
    titre: string
  }>
>
