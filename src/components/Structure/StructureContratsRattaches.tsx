import { ReactElement } from 'react'

import Badge from '@/components/shared/Badge/Badge'
import Table from '@/components/shared/Table/Table'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function StructureContratsRattaches({ contratsRattaches }: Props): ReactElement {
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
          {contratsRattaches.map((contrat) => (
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

type Props = Readonly<{
  contratsRattaches: StructureViewModel['contratsRattaches']
}>
