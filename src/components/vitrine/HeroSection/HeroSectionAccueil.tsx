import { ReactElement } from 'react'

import styles from './HeroSectionAccueil.module.css'

export default function HeroSectionAccueil(): ReactElement {
  return (
    <section
      className="fr-py-12w"
      style={{
        backgroundImage: 'url(/vitrine/accueil/hero-background-hd.png)',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-8 fr-text--center">
            {/* Badge Nouvelle plateforme */}
            <div
              className="fr-mb-2w"
              style={{ textAlign: 'center' }}
            >
              <span className={`fr-badge fr-badge--sm ${styles.badge}`}>
                <span
                  aria-hidden="true"
                  className="fr-icon-flashlight-fill fr-icon--xs"
                />
                {' '}
                Nouvelle plateforme
              </span>
            </div>

            {/* Titre principal */}
            <h1
              className="fr-display--lg fr-mb-2w"
              style={{ color: '#000091', textAlign: 'center' }}
            >
              Inclusion Numérique
            </h1>

            {/* Sous-titre */}
            <p
              className="fr-text--lead fr-mb-6w"
              style={{ textAlign: 'center' }}
            >
              La plateforme des acteurs de l&apos;inclusion numérique en France
            </p>

            {/* Logos */}
            <div
              className="fr-mt-4w"
              style={{
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  height: '50px',
                  width: '50px',
                }}
              >
                <img
                  alt="La Coop de la médiation numérique"
                  src="/vitrine/accueil/logo-coop.png"
                  style={{
                    height: '100%',
                    objectFit: 'contain',
                    width: '100%',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  height: '50px',
                  width: '50px',
                }}
              >
                <img
                  alt="Cartographie Nationale"
                  src="/vitrine/accueil/logo-carto.png"
                  style={{
                    height: '100%',
                    objectFit: 'contain',
                    width: '100%',
                  }}
                />
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '6.667px',
                  display: 'flex',
                  height: '50px',
                  overflow: 'hidden',
                  width: '50px',
                }}
              >
                <img
                  alt="Aidants Connect"
                  src="/vitrine/accueil/logo-aidants-connect.png"
                  style={{
                    height: '100%',
                    objectFit: 'contain',
                    width: '100%',
                  }}
                />
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '6.667px',
                  display: 'flex',
                  height: '50px',
                  overflow: 'hidden',
                  width: '50px',
                }}
              >
                <img
                  alt="Conseillers Numériques"
                  src="/vitrine/accueil/logo-conseillers-numeriques.png"
                  style={{
                    height: '100%',
                    objectFit: 'contain',
                    width: '100%',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  height: '50px',
                  width: '50px',
                }}
              >
                <img
                  alt="MedNum"
                  src="/vitrine/accueil/logo-mednum.png"
                  style={{
                    height: '100%',
                    objectFit: 'contain',
                    width: '100%',
                  }}
                />
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '6.667px',
                  display: 'flex',
                  height: '50px',
                  overflow: 'hidden',
                  width: '50px',
                }}
              >
                <img
                  alt="France Numérique Ensemble"
                  src="/vitrine/accueil/logo-data-inclusion.png"
                  style={{
                    height: '100%',
                    objectFit: 'cover',
                    width: '100%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
