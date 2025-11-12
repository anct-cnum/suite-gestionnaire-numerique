import Image from 'next/image'
import { ReactElement } from 'react'

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
              L&apos;inclusion numérique en réponse à un phénomène social
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
                  position: 'relative',
                  width: '50px',
                }}
              >
                <Image
                  alt="La Coop de la médiation numérique"
                  fill
                  src="/vitrine/accueil/logo-coop-vector.svg"
                  style={{ objectFit: 'contain' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  height: '50px',
                  position: 'relative',
                  width: '50px',
                }}
              >
                <Image
                  alt="Cartographie Nationale"
                  fill
                  src="/vitrine/accueil/logo-carto.svg"
                  style={{ objectFit: 'contain' }}
                />
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '6.667px',
                  display: 'flex',
                  height: '50px',
                  overflow: 'hidden',
                  position: 'relative',
                  width: '50px',
                }}
              >
                <Image
                  alt="Aidants Connect"
                  fill
                  src="/vitrine/accueil/logo-aidants-connect.svg"
                  style={{ objectFit: 'contain', padding: '8px' }}
                />
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '6.667px',
                  display: 'flex',
                  height: '50px',
                  overflow: 'hidden',
                  position: 'relative',
                  width: '50px',
                }}
              >
                <Image
                  alt="Conseillers Numériques"
                  fill
                  src="/vitrine/accueil/logo-conseillers-numeriques.svg"
                  style={{ objectFit: 'contain', padding: '8px' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  height: '50px',
                  position: 'relative',
                  width: '50px',
                }}
              >
                <Image
                  alt="MedNum"
                  fill
                  src="/vitrine/accueil/logo-mednum.svg"
                  style={{ objectFit: 'contain' }}
                />
              </div>

              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '6.667px',
                  display: 'flex',
                  height: '50px',
                  overflow: 'hidden',
                  position: 'relative',
                  width: '50px',
                }}
              >
                <Image
                  alt="France Numérique Ensemble"
                  fill
                  src="/vitrine/accueil/logo-frame3031.png"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
