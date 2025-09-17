import { ReactElement } from 'react'

import { ServiceInclusionNumeriqueData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'

export default function LieuInclusionDetailsServicesModalite(props: Props): ReactElement {
  const { data } = props

  const allModalites = data.flatMap(service => service.modalites)
  const uniqueModalites = [...new Set(allModalites)]

  const hasPresentielSurPlace = uniqueModalites.includes('Se présenter sur place')
  const hasTelephone = uniqueModalites.includes('Téléphone')
  const hasEmail = uniqueModalites.includes('Contacter par mail')

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
          {hasPresentielSurPlace ?
            <span className="fr-tag fr-tag--sm">
              <span className="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1v" />
              {' '}
              Se présenter sur place
            </span> : null}

          {hasTelephone ?
            <span className="fr-tag fr-tag--sm">
              <span className="fr-icon-phone-line fr-icon--sm fr-mr-1v" />
              {' '}
              Téléphone
            </span> : null}

          {hasEmail ?
            <span className="fr-tag fr-tag--sm">
              <span className="fr-icon-mail-line fr-icon--sm fr-mr-1v" />
              {' '}
              Contacter par mail
            </span> : null}
        </div>
      </div>

      <div className="fr-mb-3w">
        <h5 className="fr-text--md fr-mb-1w">
          Téléphone de contact
        </h5>
        <p className="fr-text--md">
          05 50 59 43 14
        </p>
      </div>

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
          <span className="fr-tag fr-tag--sm">
            Gratuit
          </span>
          <span className="fr-tag fr-tag--sm">
            Gratuit sous condition
          </span>
          <span className="fr-tag fr-tag--sm">
            Payant
          </span>
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  data: ReadonlyArray<ServiceInclusionNumeriqueData>
}>
