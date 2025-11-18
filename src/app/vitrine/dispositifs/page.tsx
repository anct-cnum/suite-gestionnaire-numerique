import { Metadata } from 'next'
import { ReactElement } from 'react'

import styles from './page.module.css'
import HeroSection from '@/components/vitrine/HeroSection/HeroSection'
import QuiSommesNous from '@/components/vitrine/QuiSommesNous/QuiSommesNous'

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
        backgroundImage="/vitrine/dispositifs/hero.png"
        subtitle="Répondre collectivement aux besoins d'accompagnement de la population"
        title="Les dispositifs d'inclusion numérique"
      />

      {/* Section Conseiller numérique */}
      <section className="fr-py-8w">
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
                  src="/vitrine/dispositifs/logo-conseillers-numeriques.png"
                  style={{ height: 'auto', width: '80px' }}
                />
              </div>
              <h2
                className="fr-h2"
                style={{ color: '#000091', marginBottom: 0 }}
              >
                Conseiller numérique
              </h2>
              <p className="fr-text--md">
                Les conseillers numériques sont des initiatives de proximité qui offrent :
              </p>
              <ul className="fr-text--md">
                <li>
                  Un accompagnement dans tous les usages quotidiens du numérique
                </li>
                <li>
                  Identifier vos appels, la typologie d&apos;un bénéficiaire et sa demande
                </li>
                <li>
                  Évaluer son niveau numérique
                </li>
                <li>
                  Proposer et organiser des sessions d&apos;accompagnement en ligne
                </li>
              </ul>
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
                padding: '40px',
              }}
            >
              <img
                alt="Illustration Conseiller numérique"
                src="/vitrine/dispositifs/illustration-conseiller.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Aidants Connect */}
      <section className="fr-py-4w">
        <div className="fr-container">
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div className={`fr-col-12 fr-col-md-6 ${styles.aidantsConnectImage}`}>
              <img
                alt="Illustration Aidants Connect"
                src="/vitrine/dispositifs/illustration-aidants-connect.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
            <div className={`fr-col-12 fr-col-md-5 ${styles.aidantsConnectContent}`}>
              <div>
                <img
                  alt="Logo Aidants Connect"
                  src="/vitrine/dispositifs/logo-aidants-connect.png"
                  style={{ height: 'auto', width: '80px' }}
                />
              </div>
              <h2
                className="fr-h2"
                style={{ color: '#000091', marginBottom: 0 }}
              >
                Aidants Connect
              </h2>
              <p className="fr-text--md">
                Vous accompagnez des personnes en difficulté avec le numérique dans la réalisation
                de leurs démarches en ligne ? Aidants Connect est fait pour vous !
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
      <QuiSommesNous />
    </>
  )
}
