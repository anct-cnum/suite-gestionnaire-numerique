import React, { ReactElement } from 'react'

import { LieuActiviteData } from './AidantDetails'
import { isNullish } from '@/shared/lang'

export default function AidantDetailsLieuxActivite(props: Props): ReactElement {
  const { data: lieuxActivite, nom, prenom } = props
  const lieux = lieuxActivite
    .filter(lieu => lieu.nom !== 'Structure inconnue')
  return (
    <section className="fr-mb-4w grey-border border-radius fr-p-4w">
      <h2 className="fr-h3 fr-mb-1w">
        Lieux d&apos;activité
      </h2>
      <p className="fr-text--sm fr-text-mention--grey">
        Les lieux d&apos;activités du médiateur
      </p>

      {lieux.length === 0 ? (
        <div
          style={{ backgroundColor: 'var(--blue-france-975-75)', borderRadius: '1rem', padding: '3rem', textAlign: 'center' }}
        >
          <p
            className="fr-text--md fr-mb-0"
            style={{ textAlign: 'center' }}
          >
            <span className="fr-text--bold">
              👻 Aucun lieu d&apos;activité trouvé
            </span>
            {' '}
            pour
            {' '}
            {nom}
            {' '}
            {prenom}
          </p>
        </div>
      ) : (
        <>
          <hr className="fr-hr " />
          {lieux.map((lieu, index) => (
            <React.Fragment key={lieu.nom}>
              <div className="fr-grid-row fr-grid-row--middle fr-mb-2w">
                <div className="fr-col-12 fr-col-md-10">
                  <div
                    className="fr-text--bold"
                    style={{
                      color: 'var(--blue-france-sun-113-625)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={lieu.nom}
                  >
                    {lieu.nom}
                  </div>
                  <div className="fr-text--sm fr-my-1w">
                    <span
                      aria-hidden="true"
                      className="fr-icon-map-pin-2-line fr-text--sm fr-text-mention--grey"
                    />
                    {isNullish(lieu.idCoopCarto) ? (
                      <span
                        className="fr-m-0"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={lieu.adresse}
                      >
                        {lieu.adresse}
                      </span>
                    ) : (
                      <a
                        className="fr-m-0"
                        href={`https://cartographie.societenumerique.gouv.fr/cartographie/${lieu.idCoopCarto}/details`}
                        rel="noopener noreferrer"
                        style={{ color: 'var(--blue-france-sun-113-625)' }}
                        target="_blank"
                        title={lieu.adresse}
                      >
                        {lieu.adresse}
                      </a>
                    )}
                  </div>
                </div>
                <div className="fr-col-12 fr-col-md-2 fr-text--center" >
                  <div className="fr-text--xl fr-text--bold fr-m-0">
                    {lieu.nombreAccompagnements}
                  </div>
                  <div className="fr-text--sm fr-text-mention--grey fr-m-0">
                    Accompagnements (sur 30 j.)
                  </div>
                </div>
              </div>
              {index < lieuxActivite.length - 1 && (
                <hr className="fr-hr  fr-mt-2w" />
              )}
            </React.Fragment>
          ))}
        </>)}
    </section>
  )
}

type Props = Readonly<{
  data: ReadonlyArray<LieuActiviteData>
  nom: string
  prenom: string
}>
