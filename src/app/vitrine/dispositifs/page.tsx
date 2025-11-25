import { Metadata } from 'next'
import { ReactElement } from 'react'

import styles from './page.module.css'
import HeroSection from '@/components/vitrine/HeroSection/HeroSection'
import QuiSommesNous from '@/components/vitrine/QuiSommesNous/QuiSommesNous'

export const metadata: Metadata = {
  description: 'Découvrez les dispositifs d\'inclusion numérique : conseillers numériques, Aidants Connect, ateliers de montée en compétences. Répondre collectivement aux besoins d\'accompagnement de la population.',
  keywords: ['conseiller numérique', 'Aidants Connect', 'dispositifs inclusion', 'accompagnement numérique', 'ateliers numériques'],
  openGraph: {
    description: 'Découvrez les dispositifs d\'inclusion numérique pour accompagner tous les publics.',
    locale: 'fr_FR',
    title: 'Les dispositifs d\'inclusion numérique - Inclusion Numérique',
    type: 'website',
  },
  robots: {
    follow: true,
    index: true,
  },
  title: 'Les dispositifs d\'inclusion numérique - Inclusion Numérique',
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
              <p className="fr-text--md fr-mb-0">
                Les conseillers et conseillères numériques sont des médiateurs co-financés par l&apos;Etat. Ils :
              </p>
              {' '}
              <ul
                className="fr-text--md"
                style={{ listStyleType: 'disc', paddingLeft: '0.75rem' }}
              >
                <li>
                  Soutiennent les français.es dans leurs usages quotidiens du numérique
                </li>
                <li>
                  Sensibilisent aux enjeux du numérique afin d&apos;en favoriser des usages citoyens et critiques ;
                </li>
                <li>
                  Rendent autonomes les citoyens dans l&apos;accès aux démarches administratives en ligne
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
                Formation Aidants numériques et/ou Aidants Connect
              </h2>
              <p className="fr-text--md">
                Une enveloppe financière a été dédiée à la formation des professionnels du territoire à l’inclusion et à la médiation numérique, ainsi qu'à l'utilisation de l'outil Aidants Connect.
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
