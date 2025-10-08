'use client'

import Image from 'next/image'
import { ReactElement, useState } from 'react'

import { PersonneTravaillantData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'

export default function LieuInclusionDetailsPersonnes(props: Props): ReactElement {
  const { data } = props
  const [showAll, setShowAll] = useState(false)

  const displayedPersonnes = showAll ? data : data.slice(0, 3)
  const hasMoreThanThree = data.length > 3

  if (data.length === 0) {
    return (
      <section className="fr-mb-4w grey-border border-radius fr-p-4w">
        <h2 className="fr-h5 fr-text-title--blue-france fr-mb-0">
          <span
            aria-hidden="true"
            className="fr-icon-account-circle-line fr-icon--sm fr-mr-1w"
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
          className="fr-icon-account-circle-line fr-icon--md fr-mr-1w fr-text-title--blue-france"
          style={{
            backgroundColor: 'var(--blue-france-975-75)',
            borderRadius: '0.5rem',
            height: '0.5rem',
            padding: '0.5rem',
            width: '0.5rem',
          }}
        />
        Personnes identifiées travaillant dans ce lieu
        ·
        {` ${  data.length}`}
      </h2>
      <hr className="fr-hr fr-mt-3w" />
      <div>
        {displayedPersonnes.map((personne) => (
          <div
            className="fr-mb-3w"
            key={personne.id}
          >
            <h3 className="fr-h6 fr-mb-1w fr-text--bold">
              {personne.prenom}
              {' '}
              {personne.nom}
            </h3>
            <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-text--sm">
              {typeof personne.role === 'string' && (
                <div className="fr-col-auto fr-grid-row fr-grid-row--middle">
                  <Image
                    alt=""
                    height={25}
                    src={`${process.env.NEXT_PUBLIC_HOST}/conum.svg`}
                    width={25}
                  />
                  <span className="fr-text--sm fr-ml-1v fr-mb-0">
                    {personne.role}
                  </span>
                </div>
              )}

              {typeof personne.email === 'string' && (
                <div className="fr-col-auto">
                  <span
                    aria-hidden="true"
                    className="fr-icon-mail-line fr-icon--sm fr-mr-1v"
                  />
                  <span className="fr-text--sm fr-ml-1v">
                    {personne.email}
                  </span>
                </div>
              )}

              {typeof personne.telephone === 'string' && (
                <div className="fr-col-auto">
                  <span
                    aria-hidden="true"
                    className="fr-icon-phone-line fr-icon--sm fr-mr-1v"
                  />
                  <span className="fr-text--sm">
                    {personne.telephone}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {hasMoreThanThree ?
          <div className="fr-mt-1w">
            <button
              className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
              onClick={() => { setShowAll(!showAll) }}
              type="button"
            >
              {showAll ? 'Voir moins' : 'Voir tous'}
              {' '}
              <span
                aria-hidden="true"
                className={`fr-icon--sm fr-ml-1w ${showAll ? 'fr-icon-arrow-up-s-line' : 'fr-icon-arrow-down-s-line'}`}
              />
            </button>
          </div> : null}
      </div>
    </section>
  )
}

type Props = Readonly<{
  data: ReadonlyArray<PersonneTravaillantData>
}>
