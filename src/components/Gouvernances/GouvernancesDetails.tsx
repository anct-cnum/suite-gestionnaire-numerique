import Link from 'next/link'
import { ReactElement } from 'react'

import Table from '@/components/shared/Table/Table'
import { MontantPositif } from '@/domain/shared/MontantPositif'
import { Optional } from '@/shared/Optional'

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
                  {`${detail.dotationEtatMontant.format()} €`}
                </span>
              </td>
              <td>
                <span className="fr-text--sm">
                  {`${detail.montantEngager.format()} €`}
                </span>
              </td>
              <td>
                <span className="fr-text--sm">
                  {`${detail.coFinancementMontant.format()} €`}
                </span>
              </td>
              <td>
                <span className="fr-text--sm fr-text--bold">
                  {`${detail.montantEngager
                    .add(Optional.of(detail.coFinancementMontant))
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
  coFinancementMontant: MontantPositif
  coporteurCount: number
  departementCode: string
  departementNom: string
  departementRegion: string
  dotationEtatMontant: MontantPositif
  feuilleDeRouteCount: number
  membreCount: number
  montantEngager: MontantPositif
}

