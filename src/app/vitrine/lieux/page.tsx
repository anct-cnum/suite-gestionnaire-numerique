import { Metadata } from 'next'
import Link from 'next/link'
import { ReactElement } from 'react'

import HeroSection from '@/components/vitrine/HeroSection/HeroSection'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
}

export default function LieuxPage(): ReactElement {
  return (
    <>
      <HeroSection
        backgroundImage="/vitrine/lieux/hero-background.png"
        subtitle="Outil d'orientation et de pilotage, la cartographie mobilise des données territoriales pour une meilleure compréhension des dynamiques d'inclusion."
        title="Qu'est-ce que la cartographie nationale des lieux d'inclusion numérique ?"
      />

      {/* Section Cartographie des lieux */}
      <section className="fr-py-12w">
        <div className="fr-container">
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', gap: '80px' }}
          >
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
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
                Que vous soyez un particulier ou un professionnel, la cartographie nationale est là
                pour vous aider à trouver les lieux d&apos;inclusion numérique avec des services
                adaptés à vos besoins ou à ceux de vos bénéficiaires !
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
                src="/vitrine/lieux/illustration-cartographie.png"
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
            style={{ alignItems: 'center', gap: '80px' }}
          >
            <div className="fr-col-12 fr-col-md-6">
              <img
                alt="Visualisation des indicateurs territoriaux"
                src="/vitrine/lieux/illustration-visualisation.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
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
                La nouvelle cartographie permet de mieux piloter l&apos;inclusion numérique grâce à
                la superposition d&apos;indicateurs territoriaux, comme l&apos;Indice de fragilité
                numérique. Elle aide les acteurs publics et locaux à identifier les zones à
                renforcer et à orienter leurs actions pour une gouvernance plus éclairée.
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
            style={{ alignItems: 'center', gap: '80px' }}
          >
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
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
                En plus d&apos;intégrer la cartographie sur votre site et de le relier à la source
                de données de votre choix,Vous pouvez aussi télécharger les données de votre
                territoire disponibles sur notre API
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
              style={{ height: 'auto', maxHeight: '80px', maxWidth: '80px', width: 'auto' }}
            />
          </div>
          <h2
            className="fr-mb-8w"
            style={{
              color: '#000091',
              fontSize: '2.5rem',
              fontWeight: 700,
              lineHeight: '3rem',
              textAlign: 'center',
            }}
          >
            Exemples d&apos;intégration de la cartographie
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              margin: '0 auto',
              maxWidth: '960px',
            }}
          >
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                display: 'flex',
                gap: '40px',
                padding: '40px',
              }}
            >
              <div style={{ display: 'flex', flex: '1', flexDirection: 'column', gap: '16px' }}>
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
                    borderRadius: '16px',
                    display: 'inline-block',
                    padding: '4px 12px',
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
                style={{
                  alignItems: 'center',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  display: 'flex',
                  height: '200px',
                  justifyContent: 'center',
                  minWidth: '300px',
                  width: '300px',
                }}
              >
                <img
                  alt="Logo Medium Hub Antilles"
                  src="/vitrine/lieux/logo-medium.png"
                  style={{ height: 'auto', maxHeight: '51px', maxWidth: '174px', width: 'auto' }}
                />
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                display: 'flex',
                gap: '40px',
                padding: '40px',
              }}
            >
              <div style={{ display: 'flex', flex: '1', flexDirection: 'column', gap: '16px' }}>
                <h3
                  style={{
                    color: '#161616',
                    fontSize: '1.875rem',
                    fontWeight: 700,
                    lineHeight: '2.25rem',
                    margin: 0,
                  }}
                >
                  Cartographie Nationale
                </h3>
                <div
                  style={{
                    backgroundColor: '#e3e3fd',
                    borderRadius: '16px',
                    display: 'inline-block',
                    padding: '4px 12px',
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
                    France
                  </span>
                </div>
                <p style={{ color: '#3a3a3a', fontSize: '1rem', lineHeight: '1.5rem', margin: 0 }}>
                  Nous sommes notre premier intégrateur.
                </p>
                <div>
                  <a
                    className="fr-link fr-fi-external-link-line fr-link--icon-right"
                    href="https://cartographie.societenumerique.gouv.fr/cartographie"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block' }}
                    target="_blank"
                  >
                    Consulter notre cartographie
                  </a>
                </div>
              </div>
              <div
                style={{
                  alignItems: 'center',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  display: 'flex',
                  height: '200px',
                  justifyContent: 'center',
                  minWidth: '300px',
                  width: '300px',
                }}
              >
                <img
                  alt="Logo Cartographie Nationale"
                  src="/vitrine/lieux/logo-cartographie-nationale.png"
                  style={{ height: 'auto', maxHeight: '180px', maxWidth: '280px', width: 'auto' }}
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
              style={{ height: 'auto', maxHeight: '80px', maxWidth: '80px', width: 'auto' }}
            />
          </div>
          <h2
            className="fr-mb-8w"
            style={{
              color: '#000091',
              fontSize: '2.5rem',
              fontWeight: 700,
              lineHeight: '3rem',
              textAlign: 'center',
            }}
          >
            Les avantages de cet outil
          </h2>

          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '16px',
              display: 'flex',
              gap: '24px',
              padding: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flex: '1',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div>
                <img
                  alt="Icône Orientation"
                  src="/vitrine/lieux/icone-orientation.png"
                  style={{ height: '80px', width: '80px' }}
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
                gap: '16px',
              }}
            >
              <div>
                <img
                  alt="Icône Standardisation"
                  src="/vitrine/lieux/icone-standardisation.png"
                  style={{ height: '80px', width: '80px' }}
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
                par la Mednum , Datactivist et l&apos;ANCT .
              </p>
            </div>

            <div style={{ borderLeft: '1px solid #ddd', height: 'auto', width: '1px' }} />

            <div
              style={{
                display: 'flex',
                flex: '1',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div>
                <img
                  alt="Icône La mise à jour"
                  src="/vitrine/lieux/icone-mise-a-jour.png"
                  style={{ height: '80px', width: '80px' }}
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
                La mise à jour
              </h3>
              <p style={{ color: '#3a3a3a', fontSize: '1rem', lineHeight: '1.5rem', margin: 0 }}>
                En lien avec 
                {' '}
                <strong>
                  La Coop de la médiation numérique
                </strong>
                {' '}
                , l&apos;
                <strong>
                  entrepôt de données
                </strong>
                {' '}
                et
                {' '}
                <strong>
                  Mon Inclusion Numérique (MIN)
                </strong>
                {' '}
                , la mise à jour des offres devient
                simple, centralisée et ouverte à tous grâce à l&apos;open data.
              </p>
            </div>

            <div style={{ borderLeft: '1px solid #ddd', height: 'auto', width: '1px' }} />

            <div
              style={{
                display: 'flex',
                flex: '1',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div>
                <img
                  alt="Icône Visibilité"
                  src="/vitrine/lieux/icone-visibilite.png"
                  style={{ height: '80px', width: '80px' }}
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
                Conçue à l&apos;échelle nationale, la cartographie permet une visualisation fine de
                l&apos;offre à l&apos;échelle locale. Ouverte et contributive, la base de données
                peut être réutilisée par tous les acteurs du territoire.
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
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <h2
                className="fr-h2"
                style={{ color: '#000091', marginBottom: 0 }}
              >
                Vous souhaitez savoir comment apparaître sur la cartographie ou mettre à jour vos
                données ?
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
              style={{ height: 'auto', maxHeight: '80px', maxWidth: '80px', width: 'auto' }}
            />
          </div>
          <h2
            className="fr-mb-2w"
            style={{
              color: '#000091',
              fontSize: '2.5rem',
              fontWeight: 700,
              lineHeight: '3rem',
              textAlign: 'center',
            }}
          >
            Découvrez nos ressources sur Les Bases
          </h2>
          <p
            className="fr-text--md fr-mb-8w"
            style={{ textAlign: 'center' }}
          >
            En savoir plus sur cette cartographie et ses usages variés
          </p>

          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '16px',
              display: 'flex',
              gap: '24px',
              padding: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flex: '1',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FEF7DA',
                  borderRadius: '8px',
                  display: 'flex',
                  height: '96px',
                  justifyContent: 'center',
                  width: '96px',
                }}
              >
                <img
                  alt="Icône Diffuser"
                  src="/vitrine/lieux/icone-diffuser.png"
                  style={{ height: '40px', width: '40px' }}
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
                className="fr-text--sm"
                style={{ marginBottom: 0 }}
              >
                Vous souhaitez partager la cartographie au sein de votre réseau ? Vous êtes au bon
                endroit !
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

            <div style={{ borderLeft: '1px solid #ddd', height: 'auto', width: '1px' }} />

            <div
              style={{
                display: 'flex',
                flex: '1',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FEF7DA',
                  borderRadius: '8px',
                  display: 'flex',
                  height: '96px',
                  justifyContent: 'center',
                  width: '96px',
                }}
              >
                <img
                  alt="Icône Collecter"
                  src="/vitrine/lieux/icone-collecter.png"
                  style={{ height: '40px', width: '40px' }}
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
                className="fr-text--sm"
                style={{ marginBottom: 0 }}
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

            <div style={{ borderLeft: '1px solid #ddd', height: 'auto', width: '1px' }} />

            <div
              style={{
                display: 'flex',
                flex: '1',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FEF7DA',
                  borderRadius: '8px',
                  display: 'flex',
                  height: '96px',
                  justifyContent: 'center',
                  width: '96px',
                }}
              >
                <img
                  alt="Icône Évolution"
                  src="/vitrine/lieux/icone-evolution.png"
                  style={{ height: '40px', width: '40px' }}
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
                className="fr-text--sm"
                style={{ marginBottom: 0 }}
              >
                Descriptif des évolutions du standard national des lieux d&apos;inclusion numérique
                (version 1.0.1)
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
      <section
        className="fr-py-12w"
        style={{ backgroundColor: '#f5f5fe' }}
      >
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--center">
            <div
              className="fr-col-12 fr-col-md-10"
              style={{ maxWidth: '996px' }}
            >
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
                {' '}
              </div>

              <h2
                className="fr-h2 fr-mb-6w"
                style={{
                  color: '#000091',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  lineHeight: '3rem',
                  textAlign: 'center',
                }}
              >
                Qui sommes nous ?
              </h2>

              <p
                className="fr-text--md"
                style={{ marginBottom: '24px', textAlign: 'center' }}
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
                qui porte la politique nationale d&apos;inclusion numérique, formalisée par une
                feuille de route co-écrite avec l&apos;ensemble des acteurs du secteur :
                {' '}
                <a
                  className="fr-link"
                  href="https://www.societenumerique.gouv.fr/nos-missions/france-numerique-ensemble"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  France Numérique Ensemble
                </a>
                . Le programme œuvre pour le développement d&apos;un numérique d&apos;intérêt
                général qui ambitionne d&apos;être ouvert, éthique, durable, souverain et, bien sûr,
                inclusif. Nous suivons l&apos;approche
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
