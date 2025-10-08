import { ReactElement } from 'react'

export default function LieuInclusionDetailsServicesTypePublic(props: Props): ReactElement {
  const { priseEnChargeSpecifique } = props
  return (
    <div className="fr-p-4w">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col fr-col-12 fr-col-md-8">
          <h4 className="fr-h6 fr-mb-1v">
            Types de publics accueillis
          </h4>
          <p className="fr-text--sm fr-mb-2w">
            Indiquez si ou non accueillez des publics ayant des besoins spécifiques.
          </p>
        </div>
        <div className="fr-col fr-col-12 fr-col-md-4">
          <div className="fr-grid-row fr-grid-row--right" />
        </div>
      </div>

      <div className="fr-mb-3w">
        <h5 className="fr-text--md fr-mb-2w">
          Précisez les publics accueillis dans ce lieu
        </h5>
        <span className="fr-tag fr-tag--sm">
          <span className="fr-icon-user-heart-line fr-icon--mg fr-mr-1w"  />
          {' '}
          Tout public
        </span>
      </div>

      <div>
        <h5 className="fr-text--md fr-mb-2w">
          Prise en charge spécifique
        </h5>
        <p className="fr-text--sm fr-mb-2w">
          Indiquez si le lieu est en mesure d&apos;accompagner et soutenir des publics ayant des besoins particuliers.
        </p>

        {priseEnChargeSpecifique && priseEnChargeSpecifique.length > 0 ? (
          <div className="fr-tags-group">
            {priseEnChargeSpecifique.map((priseEnCharge) => (
              <span
                className="fr-tag fr-tag--mg"
                key={priseEnCharge}
              >
                {priseEnCharge}
              </span>
            ))}
          </div>
        ) : (
          <p className="fr-text--sm">
            Aucune prise en charge spécifique renseignée.
          </p>
        )}
      </div>
    </div>
  )
}

type Props = Readonly<{
  priseEnChargeSpecifique?: ReadonlyArray<string>
}>
