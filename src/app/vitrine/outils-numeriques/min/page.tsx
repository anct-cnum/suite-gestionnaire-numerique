import { Metadata } from 'next'
import { ReactElement } from 'react'

import styles from './page.module.css'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import QuiSommesNous from '@/components/vitrine/QuiSommesNous/QuiSommesNous'
import ToolCard from '@/components/vitrine/ToolCard/ToolCard'

export const metadata: Metadata = {
  description: 'Mon Inclusion Numérique : outil de visualisation de données et de pilotage de l\'inclusion numérique dans les territoires. Accédez aux données départementales et régionales, pilotez la feuille de route France Numérique Ensemble.',
  keywords: ['Mon Inclusion Numérique', 'pilotage territorial', 'données inclusion', 'gouvernance territoriale', 'feuille de route', 'collectivités'],
  openGraph: {
    description: 'Outil de visualisation de données et de pilotage de l\'inclusion numérique dans les territoires.',
    locale: 'fr_FR',
    title: 'Mon Inclusion Numérique - Inclusion Numérique',
    type: 'website',
  },
  robots: {
    follow: true,
    index: true,
  },
  title: 'Mon Inclusion Numérique - Inclusion Numérique',
}

export default function MonInclusionNumeriquePage(): ReactElement {
  return (
    <>
      {/* Hero Section personnalisé */}
      <section
        style={{
          background: 'url(/vitrine/outils/hero.png) center/cover no-repeat',
          height: '720px',
          position: 'relative',
        }}
      >
        {/* Fil d'Ariane */}
        <div
          className="fr-container"
          style={{
            left: 0,
            paddingTop: '24px',
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 20,
          }}
        >
          <FilAriane
            items={[
              { href: '/vitrine', label: "Page d'accueil" },
              { href: '/vitrine/outils-numeriques', label: 'Outils numériques' },
              { label: 'Mon Inclusion Numérique' },
            ]}
          />
        </div>
        {/* Image au-dessus du Hero */}
        <div
          style={{
            bottom: 0,
            left: '50%',
            maxWidth: '688px',
            position: 'absolute',
            transform: 'translateX(-50%)',
            width: '100%',
            zIndex: 10,
          }}
        >
          <img
            alt="Capture d'écran de Mon Inclusion Numérique"
            src="/vitrine/outils/min/min.png"
            style={{
              border: 'none',
              borderRadius: '8px 8px 0 0',
              display: 'block',
              height: 'auto',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>

        <div
          className="fr-container"
          style={{
            alignItems: 'center',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            paddingBottom: '240px',
          }}
        >
          <div
            className="fr-grid-row fr-grid-row--center"
            style={{ width: '100%' }}
          >
            <div
              className="fr-col-12"
              style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <span
                  className="fr-badge fr-badge--sm"
                  style={{
                    backgroundColor: 'var(--yellow-tournesol-950-100)',
                    color: 'var(--yellow-tournesol-sun-407-moon-922)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="fr-icon-flashlight-fill fr-icon--xs"
                  />
                  {' '}
                  Nouvelle plateforme
                </span>
              </div>
              <h1
                style={{
                  color: '#000091',
                  fontFamily: 'Marianne',
                  fontSize: '64px',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  lineHeight: '72px',
                  marginBottom: '24px',
                  textAlign: 'center',
                }}
              >
                Mon Inclusion Numérique
              </h1>
              <p
                className="fr-text--lead"
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  marginBottom: '32px',
                  maxWidth: '800px',
                  textAlign: 'center',
                }}
              >
                L&apos;outil de pilotage par la données des dispositifs d&apos;inclusion numérique
              </p>
              <div>
                <a
                  className="fr-btn fr-btn--lg"
                  href="https://mon.inclusion-numerique.anct.gouv.fr/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Se connecter
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: À qui s'adresse cet outil ? */}
      <section className="fr-py-12w">
        <div className="fr-container">
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            {/* Illustration à gauche */}
            <div
              className={`fr-col-12 fr-col-md-6 ${styles.imageLeft}`}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '40px',
              }}
            >
              <img
                alt="Illustration carte de France avec gouvernances"
                src="/vitrine/outils/min/illustration-1.png"
                style={{
                  border: 'none',
                  display: 'block',
                  height: 'auto',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>

            {/* Contenu à droite */}
            <div className={`fr-col-12 fr-col-md-5 ${styles.contentRight}`}>
              <div>
                <img
                  alt=""
                  src="/vitrine/outils/min/logo-instituer.svg"
                  style={{ height: '56px', width: 'auto' }}
                />
              </div>
              <h2
                className="fr-h2"
                style={{ marginBottom: 0 }}
              >
                À qui s&apos;adresse cet outil ?
              </h2>
              <p className="fr-text--md">
                Mon Inclusion Numérique est conçu pour les :
              </p>
              <ul
                className="fr-text--md"
                style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}
              >
                <li>
                  <strong>
                    Collectivités territoriales
                  </strong>
                  {' '}
                  : mieux comprendre et structurer les actions locales
                </li>
                <li>
                  <strong>
                    Administrations et institutions
                  </strong>
                  {' '}
                  : piloter les politiques publiques d&apos;inclusion numérique
                </li>
                <li>
                  <strong>
                    Acteurs de terrain et associations
                  </strong>
                  {' '}
                  : comprendre l&apos;inclusion numérique sur son territoire et participer à la dynamique locale
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section titre: Un outil unique pour comprendre l'inclusion numérique */}
      <section
        className="fr-py-8w"
      >
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--center">
            <div
              className="fr-col-12 fr-col-md-8"
              style={{ textAlign: 'center' }}
            >
              <div>
                <img
                  alt=""
                  src="/vitrine/outils/min/logo-territorialiser.svg"
                  style={{ height: '56px', width: 'auto' }}
                />
              </div>
              <p
                style={{
                  color: 'var(--light-text-mention-grey, #666)',
                  fontFamily: 'Marianne',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  lineHeight: 'normal',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
              >
                piloter l&apos;inclusion numérique
              </p>
              <h2
                className="fr-h2"
                style={{ color: '#000091' }}
              >
                Un outil unique pour comprendre et piloter l&apos;inclusion numérique sur votre territoire
              </h2>

            </div>
          </div>
        </div>
      </section>

      {/* Section: Visualiser la donnée */}
      <ToolCard
        description="Une visualisation simple de données sur l'inclusion numérique à l'échelle départementale ou régionale"
        icon="/vitrine/outils/min/logo-evaluer.svg"
        imageAlt="Capture d'écran des visualisations de données"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/min/visuel-data.png"
        title="Comprendre par la donnée"
      />

      {/* Section: Piloter la feuille de route */}
      <ToolCard
        description="Des fonctionnalités pour consulter, participer, porter des actions d'inclusion numérique"
        icon="/vitrine/outils/min/logo-former-acteurs.svg"
        imageAlt="Capture d'écran du pilotage de la feuille de route"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/min/visuel-fdr.png"
        reverse
        title="Participer à une dynamique locale"
      />

      {/* Section: Suivre les dispositifs */}
      <ToolCard
        description="Un outil unique pour piloter l’ensemble des dispositifs d’inclusion d’inclusion numérique (Aidants Connect, Conseiller numérique, etc.)"
        icon="/vitrine/outils/min/logo-identifier.svg"
        imageAlt="Capture d'écran du suivi des dispositifs"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/min/visuel-dispositifs.png"
        link="https://mon.inclusion-numerique.anct.gouv.fr/"
        title="Piloter ses actions au quotidien"
      />

      {/* Section: Comment participer à une gouvernance territoriale */}
      <section
        className="fr-py-12w"
        style={{ backgroundColor: '#FFF8E1' }}
      >
        <div className="fr-container">
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            {/* Illustration à gauche */}
            <div
              className={`fr-col-12 fr-col-md-5 ${styles.imageLeft}`}
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <img
                alt="Illustration gouvernance territoriale"
                src="/vitrine/accueil/illustration-participer.png"
                style={{
                  height: 'auto',
                  maxWidth: '384px',
                  width: '100%',
                }}
              />
            </div>

            {/* Contenu à droite */}
            <div className={`fr-col-12 fr-col-md-6 ${styles.contentRight}`}>
              <h2
                className="fr-h2"
                style={{ color: '#000091', marginBottom: 0 }}
              >
                Comment participer à une gouvernance territoriale ?
              </h2>
              <p className="fr-text--md">
                <strong>
                  En tant que collectivité ou acteur territorial,
                </strong>
                {' '}
                vous êtes invité à manifester votre souhait de participer à une gouvernance
                de l’inclusion numérique sur votre territoire.
                {' '}
                En tant que Conseil Régional, Conseil Département ou EPCI, vous pouvez également
                porter une feuille de route.
              </p>
              <div>
                <a
                  className="fr-btn"
                  href="https://mon.inclusion-numerique.anct.gouv.fr/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Accéder au formulaire
                  {' '}
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
