import { ReactElement } from 'react'

import Badge from '@/components/shared/Badge/Badge'
import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'
import Table from '@/components/shared/Table/Table'
import TableauVide from '@/components/shared/TableauVide/TableauVide'

export default function ContratsRattaches({ contrats, titre }: Props): ReactElement {
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
      <div className="fr-notice fr-notice--info border-radius fr-mt-3w">
        <div className="fr-notice__body fr-px-3w">
          <p className="fr-notice__title fr-text--sm fr-text--regular">
            <span className="fr-text-default--grey">
              Un contrat est considéré comme en cours tant qu’aucune rupture n’a été déclarée sur le{' '}
              <ExternalLink
                className="fr-link fr-text--sm"
                href="https://pilotage.conseiller-numerique.gouv.fr/"
                title="Tableau de pilotage"
              >
                tableau de pilotage
              </ExternalLink>{' '}
              et que les documents de fin de contrat n’ont pas été transmis.
            </span>
          </p>
        </div>
      </div>
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
  titre: string
}>
