import { ReactElement } from 'react'

import { LieuActiviteData } from './AidantDetails'
import Table from '@/components/shared/Table/Table'

export default function AidantDetailsLieuxActivite(props: Props): ReactElement {
  const { data: lieuxActivite } = props

  return (
    <section className="fr-mb-4w grey-border border-radius fr-p-4w">
      <h2 className="fr-h3 fr-mb-1w">
        Lieux d&apos;activité
      </h2>
      <p className="fr-text--sm fr-text-mention--grey fr-mb-3w">
        Les lieux d&apos;activités du médiateur
      </p>
      {lieuxActivite.length === 0 ? (
        <p className="fr-text--sm fr-text-mention--grey">
          Aucun lieu d&apos;activité renseigné
        </p>
      ) : (
        <Table
          enTetes={['Organisation', 'Accompagnements', '']}
          isHeadHidden={true}
          titre="Lieux d&apos;activité du médiateur"
        >
          {lieuxActivite.map((lieu) => (
            <tr key={lieu.nom}>
              <td>
                <div>
                  <div
                    className="fr-text--bold"
                    style={{ color: '#000091' }}
                  >
                    {lieu.nom}
                  </div>
                  <div className="fr-text--sm fr-mt-1w">
                    <span
                      aria-hidden="true"
                      className="fr-icon-map-pin-2-line fr-text--sm fr-text-mention--grey"
                    />
                    <span className="fr-ml-1w">
                      {lieu.adresse}
                    </span>
                  </div>
                </div>
              </td>
              <td className="fr-text--right">
                <div>
                  <div className="fr-text--xl fr-text--bold">
                    {lieu.nombreAccompagnements}
                  </div>
                  <div className="fr-text--sm fr-text-mention--grey">
                    Accompagnements (sur 30 j.)
                  </div>
                </div>
              </td>
              <td className="fr-text--right">
                <button
                  className="fr-btn fr-btn--secondary fr-btn--sm"
                  type="button"
                >
                  Voir sur la carte
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </section>
  )
}

type Props = Readonly<{
  data: ReadonlyArray<LieuActiviteData>
}>
