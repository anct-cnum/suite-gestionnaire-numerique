import { ReactElement } from 'react'

import styles from './HeroSectionAccueil.module.css'
import BarreLogosPartenaires from '../BarreLogosPartenaires/BarreLogosPartenaires'

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
            <h1 className={`fr-mb-2w ${styles.title}`}>
              Inclusion Numérique
            </h1>

            {/* Sous-titre */}
            <p className={`fr-mb-6w ${styles.subtitle}`}>
              La plateforme des acteurs de l&apos;inclusion numérique en France
            </p>

            {/* Logos */}
            <BarreLogosPartenaires className="fr-mt-4w" />
          </div>
        </div>
      </div>
    </section>
  )
}
