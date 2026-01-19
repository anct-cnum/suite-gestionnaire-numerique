import { ReactElement } from 'react'

import Badge from '@/components/shared/Badge/Badge'
import Table from '@/components/shared/Table/Table'

export default function ContratsRattaches({ contrats }: Props): ReactElement {
  return (
    <section
      aria-labelledby="contrats"
      className="grey-border border-radius fr-mb-2w fr-p-4w"
      id="contrats"
    >
      <h2
        className="fr-h6"
        id="contratsRattaches"
      >
        Contrats rattachés au poste
      </h2>
      <article aria-label="Contrats rattachés">
        <Table
          enTetes={['Médiateur', 'Statut du contrat', 'Contrat', 'Date de début', 'Date de fin', 'Date de rupture']}
          titre="Contrats rattachés au poste"
        >
          {contrats.map((contrat) => (
            <tr key={`${contrat.mediateur}-${contrat.contrat}-${contrat.dateDebut}`}>
              <td>
                <div className="font-weight-700">
                  {contrat.mediateur}
                </div>
                <div className="fr-text--sm color-grey">
                  {contrat.role}
                </div>
              </td>
              <td>
                <Badge color={contrat.statut.variant}>
                  {contrat.statut.libelle}
                </Badge>
              </td>
              <td className="color-grey">
                {contrat.contrat}
              </td>
              <td className="color-grey">
                {contrat.dateDebut}
              </td>
              <td className="color-grey">
                {contrat.dateFin}
              </td>
              <td className="color-grey">
                {contrat.dateRupture}
              </td>
            </tr>
          ))}
        </Table>
      </article>
    </section>
  )
}

export type ContratRattacheViewModel = Readonly<{
  contrat: string
  dateDebut: string
  dateFin: string
  dateRupture: string
  mediateur: string
  role: string
  statut: Readonly<{
    libelle: string
    variant: string
  }>
}>

type Props = Readonly<{
  contrats: ReadonlyArray<ContratRattacheViewModel>
}>
