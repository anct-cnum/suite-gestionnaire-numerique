import Link from 'next/link'
import { ReactElement } from 'react'

import { MontantPositif } from '@/components/shared/Montant/MontantPositif'
import Table from '@/components/shared/Table/Table'

export default function GouvernancesDetails({ details }: Props): ReactElement {
  return (
    <section
      aria-labelledby="tableau"
    >
      <Table
        enTetes={['Département', 'Membres', 'Feuille de route', 'Dotation État', 'Montant engagé', 'Co-finan. (i)', 'Montant total', '']}
        titre="Membres"
      >
        {details.map((detail: GouvernanceDetails) => {
          return (
            <tr key={`${detail.departementNom} ${detail.departementRegion}`}>
              <td>
                <div>
                  <span className="fr-text--sm fr-text--bold">
                    {detail.departementCode}
                    {' '}
                    -
                    {' '}
                    {detail.departementNom}
                  </span>
                  {' '}
                </div>
                <div>
                  <span className="fr-text--xs">
                    {detail.departementRegion}
                  </span>
                </div>
              </td>
              <td>
                <div>
                  <span className="fr-text--sm">
                    {detail.membreCount}

                  </span>
                  {' '}
                </div>
                <div>
                  <span className="fr-text--xs">
                    {detail.coporteurCount}
                    {' '}
                    coporteurs
                  </span>
                </div>
              </td>
              <td>
                <div>
                  <span className="fr-text--sm">
                    {detail.feuilleDeRouteCount}
                  </span>
                </div>
                <div>
                  <span className="fr-text--xs">
                    {detail.actionCount}
                    {' '}
                    actions
                  </span>
                </div>
              </td>
              <td>
                <span className="fr-text--sm">
                  {`${MontantPositif.ofNumber(detail.dotationEtatMontant).orElse(MontantPositif.Zero).format()} €`}
                </span>
              </td>
              <td>
                <span className="fr-text--sm">
                  {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
                  {`${MontantPositif.ofNumber(detail.montantEngager?.reduce((count, value) => count + value, 0)).orElse(MontantPositif.Zero).format()} €`}
                </span>
              </td>
              <td>
                <span className="fr-text--sm">
                  {`${MontantPositif.ofNumber(detail.coFinancementMontant).orElse(MontantPositif.Zero).format()} €`}
                </span>
              </td>
              <td>
                <span className="fr-text--sm fr-text--bold">
                  {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
                  {`${MontantPositif.ofNumber(detail.montantEngager?.reduce((count, value) => count + value, 0))
                    .orElse(MontantPositif.Zero)
                    .add(MontantPositif.ofNumber(detail.coFinancementMontant))
                    .orElseGet(() => MontantPositif.Zero)
                    .format()} €`}
                </span>
              </td>
              <td>
                <div style={{ textAlign: 'right' }}>
                  <Link
                    className="fr-btn fr-btn--secondary"
                    href={`/gouvernance/${detail.departementCode}`}
                  >
                    Gouvernance
                  </Link>
                </div>
              </td>
            </tr>
          )
        })}

      </Table>
    </section>
  )
}

type Props = Readonly<{
  details: Array<GouvernanceDetails>
}>
type GouvernanceDetails = {
  actionCount: number
  coFinancementMontant: number
  coporteurCount: number
  departementCode: string
  departementNom: string
  departementRegion: string
  dotationEtatMontant: number
  feuilleDeRouteCount: number
  membreCount: number
  montantEngager: Array<number>
}

