import { ReactElement } from 'react'

export default function LieuInclusionDetailsServicesModalite(props: Props): ReactElement {
  const { fraisACharge, modalitesAcces, telephone } = props

  return (
    <div className="fr-p-4w" >
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col fr-col-12 fr-col-md-8">
          <h4 className="fr-h6 fr-mb-1v">
            Modalités d&apos;accès au service
          </h4>
          <p className="fr-text--sm fr-mb-2w">
            Indiquez comment bénéficier des services d&apos;inclusion numérique.
          </p>
        </div>
        <div className="fr-col fr-col-12 fr-col-md-4">
          <div className="fr-grid-row fr-grid-row--right" />
        </div>
      </div>

      <div className="fr-mb-3w">
        <h5 className="fr-text--md fr-mb-2w">
          Modalités d&apos;accès
        </h5>
        <p className="fr-text--sm fr-mb-2w">
          Indiquez comment bénéficier de vos services. Sélectionnez-en plusieurs si choix.
        </p>

        <div className="fr-tags-group">
          {modalitesAcces && modalitesAcces.length > 0 ?
            modalitesAcces.map((modalite) => (
              <span
                className="fr-tag fr-tag--mg"
                key={modalite}
              >
                {modalite}
              </span>
            )) : (
              <span className="fr-tag fr-tag--mg">
                Non renseigné
              </span>
            )}
        </div>
      </div>

      {typeof telephone === 'string' && telephone.length > 0 ? (
        <div className="fr-mb-3w">
          <h5 className="fr-text--md fr-mb-1w">
            Téléphone de contact
          </h5>
          <a
            className="fr-link fr-text--md"
            href={`tel:${telephone}`}
          >
            {telephone}
          </a>
        </div>
      ) : null}

      <div className="fr-mb-3w">
        <h5 className="fr-text--md fr-mb-1w">
          Adresse mail de contact
        </h5>
        <a
          className="fr-link"
          href="mailto:hubnum@email.com"
        >
          hubnum@email.com
        </a>
      </div>

      <div>
        <h5 className="fr-text--md fr-mb-2w">
          Frais à charge
        </h5>
        <p className="fr-text--sm fr-mb-2w">
          Indiquez les types d&apos;accompagnements proposés dans ce lieu.
        </p>

        <div className="fr-tags-group">
          {(fraisACharge && fraisACharge.length > 0 ? fraisACharge : ['Non renseigné']).map((frais) => (
            <span
              className="fr-tag fr-tag--mg"
              key={frais}
            >
              {frais}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  fraisACharge?: ReadonlyArray<string>
  modalitesAcces?: ReadonlyArray<string>
  telephone?: string
}>
