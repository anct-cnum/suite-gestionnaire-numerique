import { ReactElement, ReactNode } from 'react'

import Badge from '@/components/shared/Badge/Badge'
import Table from '@/components/shared/Table/Table'
import TableauVide from '@/components/shared/TableauVide/TableauVide'

export default function ContratsRattaches({ bandeau, contrats, titre }: Props): ReactElement {
  return (
    <section aria-labelledby="contrats" className="grey-border border-radius fr-mb-2w fr-p-4w" id="contrats">
      <h2 className="fr-h6" id="contratsRattaches">
        {titre}
      </h2>
      <article aria-label="Contrats rattachés">
        {contrats.length === 0 ? (
          <TableauVide>
            <span className="fr-text--bold">👻 Aucun contrat rattaché</span>
            {' pour cette structure'}
          </TableauVide>
        ) : (
          <Table
            enTetes={['Médiateur', 'Statut du contrat', 'Contrat', 'Date de début', 'Date de fin', 'Date de rupture']}
            titre={titre}
          >
            {contrats.map((contrat) => (
              <tr key={`${contrat.mediateur}-${contrat.contrat}-${contrat.dateDebut}`}>
                <td>
                  <div className="font-weight-700">{contrat.mediateur}</div>
                  <div className="fr-text--sm color-grey">{contrat.role}</div>
                </td>
                <td>
                  <Badge color={contrat.statut.variant}>{contrat.statut.libelle}</Badge>
                </td>
                <td className="color-grey">{contrat.contrat}</td>
                <td className="color-grey">{contrat.dateDebut}</td>
                <td className="color-grey">{contrat.dateFin}</td>
                <td className="color-grey">{contrat.dateRupture}</td>
              </tr>
            ))}
          </Table>
        )}
      </article>
      {bandeau}
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
  bandeau?: ReactNode
  contrats: ReadonlyArray<ContratRattacheViewModel>
  titre: string
}>
