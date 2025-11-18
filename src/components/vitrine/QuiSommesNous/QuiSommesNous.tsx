import { ReactElement } from 'react'

export default function QuiSommesNous(): ReactElement {
  return (
    <section
      className="fr-py-12w"
      style={{ backgroundColor: '#f5f5fe' }}
    >
      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-10">
            {/* Titre */}
            <h2
              className="fr-h2 fr-mb-6w"
              style={{ color: '#000091', textAlign: 'center' }}
            >
              Qui sommes nous ?
            </h2>

            {/* Paragraphes avec liens */}
            <p
              className="fr-text--md fr-mb-4w"
              style={{ textAlign: 'center' }}
            >
              Nous sommes un collectif d&apos;acteurs de l&apos;inclusion numérique animé par le
              {' '}
              <a
                className="fr-link"
                href="https://societenumerique.gouv.fr/fr/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Programme Société Numérique
              </a>
              , qui porte la politique nationale d&apos;inclusion numérique, formalisée par une feuille
              de route co-écrite avec l&apos;ensemble des acteurs du secteur :
              {' '}
              <a
                className="fr-link"
                href="https://societenumerique.gouv.fr/documents/84/Feuille_route_23-27_-_engagements_mis_%C3%A0_jour.pdf"
                rel="noopener noreferrer"
                target="_blank"
              >
                France Numérique Ensemble
              </a>
              .
              {' '}

            </p>
            <p
              className="fr-text--md"
              style={{ textAlign: 'center' }}
            >
              Nous oeuvrons en commun pour le développement d&apos;un numérique d&apos;intérêt
              général qui ambitionne d&apos;être ouvert, éthique, durable, souverain et,
              bien sûr, inclusif.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
