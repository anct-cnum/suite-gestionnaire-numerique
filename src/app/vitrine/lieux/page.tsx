import { Metadata } from 'next'
import Link from 'next/link'
import { ReactElement } from 'react'

import styles from './page.module.css'
import HeroSection from '@/components/vitrine/HeroSection/HeroSection'
import QuiSommesNous from '@/components/vitrine/QuiSommesNous/QuiSommesNous'

export const metadata: Metadata = {
  description: 'Cartographie interactive des lieux d\'inclusion numérique en France. Outil de prescription et de pilotage mobilisant des données territoriales pour agir efficacement.',
  keywords: ['lieux inclusion numérique', 'cartographie', 'médiation numérique', 'structures d\'accompagnement', 'aidants numériques'],
  openGraph: {
    description: 'Cartographie interactive des lieux d\'inclusion numérique en France.',
    locale: 'fr_FR',
    title: 'Lieux d\'inclusion numérique - Inclusion Numérique',
    type: 'website',
  },
  robots: {
    follow: true,
    index: true,
  },
  title: 'Lieux d\'inclusion numérique - Inclusion Numérique',
}

export default function LieuxPage(): ReactElement {
  return (
    <>
      <HeroSection
        backgroundImage="/vitrine/lieux/hero-background.png"
        subtitle="Outil de prescription et de pilotage, la cartographie mobilise des données territoriales pour agir plus efficacement en faveur de l'inclusion numérique."
        title="Qu'est-ce que la cartographie nationale des lieux d'inclusion numérique ?"
      />

      {/* Section Cartographie des lieux */}
      <section className="fr-py-12w">
        <div className="fr-container">
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', gap: '5rem' }}
          >
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <h2
                className="fr-h2"
                style={{ marginBottom: 0 }}
              >
                Cartographie des lieux d&apos;inclusion numérique
              </h2>
              <p
                className="fr-text--md"
                style={{ marginBottom: 0 }}
              >
                Que vous soyez ou non un professionnel de la médiation numérique ou sociale,
                la cartographie nationale vous permet d&apos;orienter rapidement un bénéficiaire vers
                un lieu au sein duquel il pourra être accompagné.
              </p>
              <div>
                <Link
                  className="fr-btn"
                  href="https://cartographie.societenumerique.gouv.fr/cartographie"
                >
                  Voir la cartographie
                </Link>
              </div>
            </div>
            <div className="fr-col-12 fr-col-md-6">
              <img
                alt="Cartographie des lieux d'inclusion numérique"
                src="/vitrine/lieux/illustration-cartographie-avec-main.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Visualisation des indicateurs */}
      <section className="fr-py-12w">
        <div className="fr-container">
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', gap: '5rem' }}
          >
            <div className={`fr-col-12 fr-col-md-6 ${styles.visualisationImage}`}>
              <img
                alt="Visualisation des indicateurs territoriaux"
                src="/vitrine/lieux/illustration-visualisation.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
            <div className={`fr-col-12 fr-col-md-5 ${styles.visualisationContent}`}>
              <h2
                className="fr-h2"
                style={{ marginBottom: 0 }}
              >
                Visualisation des indicateurs territoriaux
              </h2>
              <p
                className="fr-text--md"
                style={{ marginBottom: 0 }}
              >
                Grâce à la visualisation de plusieurs indicateurs, notamment l&apos;Indice de fragilité
                numérique, la cartographie nationale permet aux acteurs de l&apos;inclusion numérique
                de mieux piloter leurs actions.
              </p>
              <div>
                <Link
                  className="fr-btn"
                  href="https://cartographie.societenumerique.gouv.fr/cartographie"
                >
                  Voir la cartographie
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Implémentation */}
      <section className="fr-py-12w">
        <div className="fr-container">
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', gap: '5rem' }}
          >
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <h2
                className="fr-h2"
                style={{ marginBottom: 0 }}
              >
                Implémentez facilement la cartographie sur votre site internet
              </h2>
              <p
                className="fr-text--md"
                style={{ marginBottom: 0 }}
              >
                La cartographie peut être facilement intégrée sur votre site. Elle peut être reliée à
                la source de données de votre choix. Vous pouvez également télécharger les données
                de votre territoire depuis notre API.
              </p>
              <div>
                <Link
                  className="fr-btn"
                  href="https://github.com/anct-cartographie-nationale/client-application#documentation"
                >
                  Intégrer la cartographie
                </Link>
              </div>
            </div>
            <div className="fr-col-12 fr-col-md-6">
              <img
                alt="Implémentez facilement la cartographie sur votre site"
                src="/vitrine/lieux/illustration-implementation.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Exemples d'intégration */}
      <section
        className="fr-py-12w"
        style={{
          backgroundImage: 'url(/vitrine/lieux/background-integration.png)',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="fr-container">
          <div
            className="fr-mb-4w"
            style={{ textAlign: 'center' }}
          >
            <img
              alt="Icône exemples"
              src="/vitrine/lieux/icone-exemples.png"
              style={{ height: 'auto', maxHeight: '5rem', maxWidth: '5rem', width: 'auto' }}
            />
          </div>
          <h2 className={`fr-mb-8w ${styles.sectionTitle}`}>
            Exemples d&apos;intégration de la cartographie
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3rem',
              margin: '0 auto',
              maxWidth: '60rem',
            }}
          >
            <div
              className="fr-grid-row fr-grid-row--gutters"
              style={{
                backgroundColor: '#fff',
                borderRadius: '1rem',
                gap: '2.5rem',
                padding: '2.5rem',
              }}
            >
              <div
                className="fr-col-12 fr-col-md-6"
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <h3
                  style={{
                    color: '#161616',
                    fontSize: '1.875rem',
                    fontWeight: 700,
                    lineHeight: '2.25rem',
                    margin: 0,
                  }}
                >
                  Mednum Hub Antilles
                </h3>
                <div
                  style={{
                    backgroundColor: '#e3e3fd',
                    borderRadius: '1rem',
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    width: 'fit-content',
                  }}
                >
                  {' '}
                  <span
                    style={{
                      color: '#000091',
                      fontSize: '0.875rem',
                      fontWeight: 400,
                      lineHeight: '1.5rem',
                    }}
                  >
                    Martinique
                  </span>
                </div>
                <p style={{ color: '#3a3a3a', fontSize: '1rem', lineHeight: '1.5rem', margin: 0 }}>
                  Cartographie des lieux d&apos;inclusion numérique de la Martinique
                </p>
                <div>
                  <a
                    className="fr-link fr-fi-external-link-line fr-link--icon-right"
                    // eslint-disable-next-line sonarjs/no-clear-text-protocols
                    href="http://anct-carto-client-feature-hub-antilles-default-view.s3-website.eu-west-3.amazonaws.com/orientation"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block' }}
                    target="_blank"
                  >
                    Cartographie de la martinique
                  </a>
                </div>
              </div>
              <div
                className="fr-col-12 fr-col-md-5"
                style={{
                  alignItems: 'center',
                  border: '1px solid #ddd',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  height: '12.5rem',
                  justifyContent: 'center',
                }}
              >
                <img
                  alt="Logo Medium Hub Antilles"
                  src="/vitrine/lieux/logo-medium.png"
                  style={{ height: 'auto', maxHeight: '3.1875rem', maxWidth: '10.875rem', width: 'auto' }}
                />
              </div>
            </div>

            <div
              className="fr-grid-row fr-grid-row--gutters"
              style={{
                backgroundColor: '#fff',
                borderRadius: '1rem',
                gap: '2.5rem',
                padding: '2.5rem',
              }}
            >
              <div
                className="fr-col-12 fr-col-md-6"
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <h3
                  style={{
                    color: '#161616',
                    fontSize: '1.875rem',
                    fontWeight: 700,
                    lineHeight: '2.25rem',
                    margin: 0,
                  }}
                >
                  Cartographie nationale
                </h3>
                <div
                  style={{
                    backgroundColor: '#e3e3fd',
                    borderRadius: '1rem',
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    width: 'fit-content',
                  }}
                >
                  <span
                    style={{
                      color: '#000091',
                      fontSize: '0.875rem',
                      fontWeight: 400,
                      lineHeight: '1.5rem',
                    }}
                  >
                    National
                  </span>
                </div>
                <p style={{ color: '#3a3a3a', fontSize: '1rem', lineHeight: '1.5rem', margin: 0 }}>
                  Nous sommes notre premier intégrateur
                </p>
                <div>
                  <a
                    className="fr-link fr-fi-external-link-line fr-link--icon-right"
                    href="https://cartographie.societenumerique.gouv.fr/cartographie"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block' }}
                    target="_blank"
                  >
                    Voir la cartographie
                  </a>
                </div>
              </div>
              <div
                className="fr-col-12 fr-col-md-5"
                style={{
                  alignItems: 'center',
                  border: '1px solid #ddd',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  height: '12.5rem',
                  justifyContent: 'center',
                }}
              >
                <img
                  alt="Logo Cartographie Nationale"
                  src="/vitrine/lieux/logo-cartographie-nationale.png"
                  style={{ height: 'auto', maxHeight: '11.25rem', maxWidth: '17.5rem', width: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Les avantages */}
      <section className="fr-py-12w">
        <div className="fr-container">
          <div
            className="fr-mb-4w"
            style={{ textAlign: 'center' }}
          >
            <img
              alt="Icône avantages"
              src="/vitrine/lieux/icone-avantages.png"
              style={{ height: 'auto', maxHeight: '5rem', maxWidth: '5rem', width: 'auto' }}
            />
          </div>
          <h2 className={`fr-mb-8w ${styles.sectionTitle}`}>
            Les avantages de cet outil
          </h2>

          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '1rem',
              display: 'flex',
              gap: '1rem',
              padding: '2.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                flex: '1',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div>
                <img
                  alt="Icône Orientation"
                  src="/vitrine/lieux/icone-orientation.png"
                  style={{ height: '5rem', width: '5rem' }}
                />
              </div>
              <h3
                style={{
                  color: '#161616',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  lineHeight: '1.75rem',
                  margin: 0,
                }}
              >
                Orientation
              </h3>
              <p style={{ color: '#3a3a3a', fontSize: '1rem', lineHeight: '1.5rem', margin: 0 }}>
                En quelques secondes, renseignez les besoins d&apos;un bénéficiaire, son adresse et
                ses disponibilités afin d&apos;afficher uniquement les lieux qui pourront
                l&apos;aider.
              </p>
            </div>

            <div style={{ borderLeft: '1px solid #ddd', height: 'auto', width: '1px' }} />

            <div
              style={{
                display: 'flex',
                flex: '1',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div>
                <img
                  alt="Icône Standardisation"
                  src="/vitrine/lieux/icone-standardisation.png"
                  style={{ height: '5rem', width: '5rem' }}
                />
              </div>
              <h3
                style={{
                  color: '#161616',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  lineHeight: '1.75rem',
                  margin: 0,
                }}
              >
                Standardisation
              </h3>
              <p style={{ color: '#3a3a3a', fontSize: '1rem', lineHeight: '1.5rem', margin: 0 }}>
                Nous référençons les lieux d&apos;inclusion numérique qui ont renseigné leurs
                données au format du standard de données des lieux d&apos;inclusion numérique établi
                par la Mednum , Datactivist et l&apos;ANCT.
              </p>
            </div>

            <div style={{ borderLeft: '1px solid #ddd', height: 'auto', width: '1px' }} />

            <div
              style={{
                display: 'flex',
                flex: '1',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div>
                <img
                  alt="Icône La mise à jour"
                  src="/vitrine/lieux/icone-mise-a-jour.png"
                  style={{ height: '5rem', width: '5rem' }}
                />
              </div>
              <h3
                style={{
                  color: '#161616',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  lineHeight: '1.75rem',
                  margin: 0,
                }}
              >
                Mise à jour
              </h3>
              <p style={{ color: '#3a3a3a', fontSize: '1rem', lineHeight: '1.5rem', margin: 0 }}>
                Les données de la cartographie sont centralisées au sein d&apos;un entrepôt géré en commun
                par les acteurs de l&apos;inclusion numérique. Cette mutualisation permet une mise à jour
                plus fréquente et plus simple de ses données.
              </p>
            </div>

            <div style={{ borderLeft: '1px solid #ddd', height: 'auto', width: '1px' }} />

            <div
              style={{
                display: 'flex',
                flex: '1',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div>
                <img
                  alt="Icône Visibilité"
                  src="/vitrine/lieux/icone-visibilite.png"
                  style={{ height: '5rem', width: '5rem' }}
                />
              </div>
              <h3
                style={{
                  color: '#161616',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  lineHeight: '1.75rem',
                  margin: 0,
                }}
              >
                Visibilité
              </h3>
              <p style={{ color: '#3a3a3a', fontSize: '1rem', lineHeight: '1.5rem', margin: 0 }}>
                La cartographie permet une visualisation fine de l&apos;offre de médiation numérique à toutes
                les échelles : nationale, régionale, départementale, locale, micro-locale. Ouverte et contributive,
                les données peuvent être réutilisées par tous les acteurs de la médiation numérique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section
        className="fr-py-12w"
        style={{ backgroundColor: '#fff8e1' }}
      >
        <div className="fr-container">
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', gap: '80px' }}
          >
            <div className="fr-col-12 fr-col-md-6">
              <img
                alt="Cartographie et mise à jour"
                src="/vitrine/lieux/illustration-cta.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <h2
                className="fr-h2"
                style={{ color: '#000091', marginBottom: 0 }}
              >
                Vous souhaitez savoir comment apparaître sur la cartographie ou mettre à jour vos données ?
              </h2>
              <div>
                <Link
                  className="fr-btn"
                  href="https://lesbases.anct.gouv.fr/ressources/comment-apparaitre-ou-modifier-vos-donnees-sur-la-cartographie-nationale"
                >
                  Référencer ma structure
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Ressources Les Bases */}
      <section className="fr-py-12w">
        <div className="fr-container">
          <div
            className="fr-mb-4w"
            style={{ textAlign: 'center' }}
          >
            <img
              alt="Icône ressources"
              src="/vitrine/lieux/icone-ressources.png"
              style={{ height: 'auto', maxHeight: '5rem', maxWidth: '5rem', width: 'auto' }}
            />
          </div>
          <h2 className={`fr-mb-2w ${styles.sectionTitle}`}>
            Découvrez nos ressources sur Les Bases
          </h2>
          <p
            className="fr-text--md fr-mb-8w"
            style={{ textAlign: 'center' }}
          >
            En savoir plus sur cette cartographie et ses usages variés
          </p>

          <div
            className="fr-grid-row fr-grid-row--gutters"
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '1rem',
              padding: '2.5rem',
            }}
          >
            <div
              className="fr-col-12 fr-col-md-4"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FEF7DA',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  height: '6rem',
                  justifyContent: 'center',
                  width: '6rem',
                }}
              >
                <img
                  alt="Icône Diffuser"
                  src="/vitrine/lieux/icone-diffuser.png"
                  style={{ height: '2.5rem', width: '2.5rem' }}
                />
              </div>
              <h3
                style={{
                  color: '#161616',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  lineHeight: '1.75rem',
                  marginBottom: 0,
                }}
              >
                Diffuser la cartographie nationale au sein de mon réseau
              </h3>
              <p
                className="fr-text--sm fr-mb-0"
              >
                Vous souhaitez partager la cartographie au sein de votre réseau ? Vous êtes au bon endroit !
              </p>
              <div>
                <Link
                  className="fr-btn fr-btn--tertiary"
                  href="https://lesbases.anct.gouv.fr/ressources/diffuser-la-cartographie-nationale-au-sein-de-mon-reseau"
                >
                  Voir la ressource
                </Link>
              </div>
            </div>

            <div
              className="fr-col-12 fr-col-md-4"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FEF7DA',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  height: '6rem',
                  justifyContent: 'center',
                  width: '6rem',
                }}
              >
                <img
                  alt="Icône Collecter"
                  src="/vitrine/lieux/icone-collecter.png"
                  style={{ height: '2.5rem', width: '2.5rem' }}
                />
              </div>
              <h3
                style={{
                  color: '#161616',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  lineHeight: '1.75rem',
                  marginBottom: 0,
                }}
              >
                Collectivité : Comment prendre en main la cartographie ?
              </h3>
              <p
                className="fr-text--sm fr-mb-0"
              >
                Vous représentez une collectivité et souhaitez utiliser la cartographie nationale ?
              </p>
              <div>
                <Link
                  className="fr-btn fr-btn--tertiary"
                  href="https://lesbases.anct.gouv.fr/ressources/collectivite-comment-prendre-en-main-la-cartographie"
                >
                  Voir la ressource
                </Link>
              </div>
            </div>

            <div
              className="fr-col-12 fr-col-md-4"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FEF7DA',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  height: '6rem',
                  justifyContent: 'center',
                  width: '6rem',
                }}
              >
                <img
                  alt="Icône Évolution"
                  src="/vitrine/lieux/icone-evolution.png"
                  style={{ height: '2.5rem', width: '2.5rem' }}
                />
              </div>
              <h3
                style={{
                  color: '#161616',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  lineHeight: '1.75rem',
                  marginBottom: 0,
                }}
              >
                Évolution du standard national des lieux d&apos;inclusion numérique
              </h3>
              <p
                className="fr-text--sm fr-mb-0"
              >
                Descriptif des évolutions du standard national des lieux d&apos;inclusion numérique (version 1.0.1)
              </p>
              <div>
                <Link
                  className="fr-btn fr-btn--tertiary"
                  href="https://lesbases.anct.gouv.fr/ressources/evolution-du-standard-national"
                >
                  Voir la ressource
                </Link>
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
