import { Metadata } from 'next'
import { ReactElement } from 'react'

import HeroSection from '@/components/vitrine/HeroSection/HeroSection'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
}

export default function DispositifsPage(): ReactElement {
  return (
    <>
      <HeroSection
        backgroundImage="/vitrine/accueil/hero-background-hd.png"
        subtitle="Nunc enim pellentesque consectetur tempor Vel lobortis accumsan luctus viverra donec nisl ac."
        title="Les dispositifs de l'inclusion numérique"
      />

      {/* Section Conseiller numérique */}
      <section className="fr-py-12w">
        <div className="fr-container">
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <div>
                <img
                  alt="Icône Conseiller numérique"
                  src="/vitrine/accueil/logo-conseillers-numeriques.svg"
                  style={{ height: 'auto', width: '40px' }}
                />
              </div>
              <h2
                className="fr-h2"
                style={{ color: '#000091', marginBottom: 0 }}
              >
                Conseiller numérique
              </h2>
              <p className="fr-text--md">
                Ipsum mattis commodo purus varius. Tristique lacus urna interdum diam pretium enim.
                Dignissim nulla condimentum tellus et enim vestibulum. Molestie.
              </p>
              <div>
                <a
                  className="fr-btn"
                  href="https://www.conseiller-numerique.gouv.fr/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  En savoir plus
                </a>
              </div>
            </div>
            <div
              className="fr-col-12 fr-col-md-6"
              style={{
                backgroundColor: '#FEF4F5',
                borderRadius: '8px',
                padding: '40px',
              }}
            >
              <img
                alt="Illustration Conseiller numérique"
                src="/vitrine/accueil/illustration-dispositifs.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Aidants Connect */}
      <section className="fr-py-12w">
        <div className="fr-container">
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div
              className="fr-col-12 fr-col-md-6"
              style={{
                backgroundColor: '#FFF8E1',
                borderRadius: '8px',
                order: 1,
                padding: '40px',
              }}
            >
              <img
                alt="Illustration Aidants Connect"
                src="/vitrine/accueil/illustration-dispositifs.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '24px', order: 2 }}
            >
              <div>
                <img
                  alt="Logo Aidants Connect"
                  src="/vitrine/accueil/logo-aidants-connect.svg"
                  style={{ height: 'auto', width: '56px' }}
                />
              </div>
              <h2
                className="fr-h2"
                style={{ color: '#000091', marginBottom: 0 }}
              >
                Aidants Connect
              </h2>
              <p className="fr-text--md">
                Ipsum mattis commodo purus varius. Tristique lacus urna interdum diam pretium enim.
                Dignissim nulla condimentum tellus et enim vestibulum. Molestie.
              </p>
              <div>
                <a
                  className="fr-btn"
                  href="https://aidantsconnect.beta.gouv.fr/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  En savoir plus
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Qui sommes-nous */}
      <section
        className="fr-py-12w"
        style={{ backgroundColor: '#f5f5fe' }}
      >
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-10">
              {/* Logos RF + ANCT */}
              <div
                className="fr-mb-6w"
                style={{ textAlign: 'center' }}
              >
                <img
                  alt="République Française - ANCT Société Numérique"
                  src="/vitrine/accueil/logo-rf-anct.svg"
                  style={{
                    display: 'inline-block',
                    height: 'auto',
                    maxWidth: '384px',
                    width: '100%',
                  }}
                />
              </div>

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
                {'. '}
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
    </>
  )
}
