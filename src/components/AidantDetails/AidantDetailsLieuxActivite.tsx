import { ReactElement } from 'react'

import { LieuActiviteData } from './AidantDetails'
import { isNullish } from '@/shared/lang'

export default function AidantDetailsLieuxActivite(props: Props): ReactElement {
  const { data: lieuxActivite } = props

  return (
    <section className="fr-mb-4w grey-border border-radius fr-p-4w">
      <h2 className="fr-h3 fr-mb-1w">
        Lieux d&apos;activité
      </h2>
      <p className="fr-text--sm fr-text-mention--grey">
        Les lieux d&apos;activités du médiateur
      </p>

      {lieuxActivite.length === 0 ? (
        <p className="fr-text--sm fr-text-mention--grey">
          Aucun lieu d&apos;activité renseigné
        </p>
      ) : (
        <>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-default-grey)', margin: '0 0 1rem 0', padding: '0' }} />
          <div
            className="fr-table fr-table--md"
            style={{ '--table-offset': 'initial' } as React.CSSProperties}
          >
            <div className="fr-table__wrapper">
              <div className="fr-table__container">
                <div className="fr-table__content">
                  <table style={{ borderCollapse: 'collapse', tableLayout: 'auto', width: '100%' }}>
                    <tbody>
                      {lieuxActivite.map((lieu, index) => (
                        <tr
                          key={lieu.nom}
                          style={{
                            borderBottom: index < lieuxActivite.length - 1 ? '1px solid var(--border-default-grey)' : 'none',
                          }}
                        >
                          <td style={{ padding: '1rem 0.5rem', width: '50%' }}>
                            <div>
                              <div
                                className="fr-text--bold"
                                style={{
                                  color: '#000091',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={lieu.nom}
                              >
                                {lieu.nom}
                              </div>
                              <div className="fr-text--sm fr-mt-1w">
                                <span
                                  aria-hidden="true"
                                  className="fr-icon-map-pin-2-line fr-text--sm fr-text-mention--grey"
                                />
                                <span
                                  className="fr-ml-1w"
                                  style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={lieu.adresse}
                                >
                                  {lieu.adresse}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 0.5rem', textAlign: 'left' }}>
                            <div className="fr-text--xl fr-text--bold">
                              {lieu.nombreAccompagnements}
                            </div>
                            <div className="fr-text--sm fr-text-mention--grey">
                              Accompagnements (sur 30 j.)
                            </div>
                          </td>
                          <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                            {isNullish(lieu.idCoopCarto) ? null : (
                              <a
                                className="fr-btn fr-btn--secondary fr-btn--sm"
                                href={`https://cartographie.societenumerique.gouv.fr/cartographie/${lieu.idCoopCarto}/details`}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                Voir sur la carte
                              </a>
                            ) }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>)}
    </section>
  )
}

type Props = Readonly<{
  data: ReadonlyArray<LieuActiviteData>
}>
