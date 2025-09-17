import { ReactElement } from 'react'

import { PersonneTravaillantData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'

export default function LieuInclusionDetailsPersonnes(props: Props): ReactElement {
  const { data } = props

  if (data.length === 0) {
    return (
      <section className="fr-mb-4w grey-border border-radius fr-p-4w">
        <h2 className="fr-h5 fr-text-title--blue-france fr-mb-0">
          <span
            aria-hidden="true"
            className="fr-icon-user-line fr-icon--sm fr-mr-1w"
          />
          {' '}
          Personnes identifiées travaillant dans ce lieu
        </h2>
        <hr className="fr-hr fr-mt-3w" />
        <p className="fr-text--sm">
          Aucune personne renseignée pour ce lieu.
        </p>
      </section>
    )
  }

  return (
    <section className="fr-mb-4w grey-border border-radius fr-p-4w">
      <h2 className="fr-h5 fr-text-title--blue-france fr-m-0">
        <span
          aria-hidden="true"
          className="fr-icon-user-line fr-icon--sm fr-mr-1w"
        />
        Personnes identifiées travaillant dans ce lieu
        ·
        {` ${  data.length}`}
      </h2>
      <hr className="fr-hr fr-mt-3w" />
      <div>
        {data.map((personne) => (
          <div key={`${personne.nom}-${personne.prenom}`}>
            <div className="fr-mb-2w">
              <h3 className="fr-h6 fr-mb-2w fr-text--bold">
                {personne.prenom}
                {' '}
                {personne.nom}
              </h3>
              <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
                {typeof personne.role === 'string' && (
                  <div className="fr-col-auto fr-mr-2w">
                    <span
                      aria-hidden="true"
                      className="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1v"
                      style={{ color: 'var(--red-marianne-main-472)' }}
                    />
                    <span className="fr-text--sm">
                      {personne.role}
                    </span>
                  </div>
                )}

                {typeof personne.email === 'string'?
                  <div className="fr-col-auto fr-mr-2w">
                    <span
                      aria-hidden="true"
                      className="fr-icon-mail-line fr-icon--sm fr-mr-1v"
                      style={{ color: '#666666' }}
                    />
                    <a
                      className="fr-link fr-text--sm"
                      href={`mailto:${personne.email}`}
                    >
                      {personne.email}
                    </a>
                  </div> : null}
                {typeof personne.telephone === 'string' ?
                  <div className="fr-col-auto fr-mr-2w">
                    <span
                      aria-hidden="true"
                      className="fr-icon-phone-line fr-icon--sm fr-mr-1v"
                      style={{ color: '#666666' }}
                    />
                    <a
                      className="fr-link fr-text--sm"
                      href={`tel:${personne.telephone}`}
                    >
                      {personne.telephone}
                    </a>
                  </div> : null}
              </div>
            </div>
            <hr className="fr-hr fr-mb-1w"  />
          </div>
        ))}
        <div className="fr-mt-1w">
          <button
            className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
            type="button"
          >
            Voir tous
            {' '}
            <span
              aria-hidden="true"
              className="fr-icon-arrow-down-s-line fr-icon--sm fr-ml-1w"
            />
          </button>
        </div>
      </div>
    </section>
  )
}

type Props = Readonly<{
  data: ReadonlyArray<PersonneTravaillantData>
}>
