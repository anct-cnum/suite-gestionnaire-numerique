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
              Nous sommes l&apos;équipe du
              {' '}
              <a
                className="fr-link"
                href="https://societenumerique.gouv.fr/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Programme Société Numérique
              </a>
              {' '}
              qui porte la politique nationale d&apos;inclusion numérique, formalisée par une feuille
              de route co-écrite avec l&apos;ensemble des acteurs du secteur :
              {' '}
              <a
                className="fr-link"
                href="https://www.societenumerique.gouv.fr/nos-missions/france-numerique-ensemble"
                rel="noopener noreferrer"
                target="_blank"
              >
                France Numérique Ensemble
              </a>
              {' '}
              .

            </p>
            <p
              className="fr-text--md fr-mb-4w"
              style={{ textAlign: 'center' }}
            >
              Le programme œuvre pour le développement d&apos;un numérique d&apos;intérêt
              général qui ambitionne d&apos;être ouvert, éthique, durable, souverain et,
              bien sûr, inclusif.
            </p>
            <p
              className="fr-text--md"
              style={{ textAlign: 'center' }}
            >
              Nous suivons l&apos;approche
              {' '}
              <a
                className="fr-link"
                href="https://beta.gouv.fr/approche"
                rel="noopener noreferrer"
                target="_blank"
              >
                beta.gouv.fr
              </a>
              {' '}
              qui place l&apos;expérience utilisateur au coeur de la conception produit.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
