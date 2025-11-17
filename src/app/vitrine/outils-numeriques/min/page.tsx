import { Metadata } from 'next'
import { ReactElement } from 'react'

import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import QuiSommesNous from '@/components/vitrine/QuiSommesNous/QuiSommesNous'
import ToolCard from '@/components/vitrine/ToolCard/ToolCard'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
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
                L&apos;outil de visualisation de la donnée et de pilotage de l&apos;inclusion
                numérique dans les territoires
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
              className="fr-col-12 fr-col-md-6"
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
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
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
                Un outil unique pour comprendre l&apos;inclusion numérique sur votre territoire
              </h2>
             
            </div>
          </div>
        </div>
      </section>

      {/* Section: Visualiser la donnée */}
      <ToolCard
        description="Une visualisation simple de données statistiques sur l'inclusion numérique à l'échelle départementale ou régionale"
        icon="/vitrine/outils/min/logo-evaluer.svg"
        imageAlt="Capture d'écran des visualisations de données"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/min/visuel-data.png"
        title="Visualiser la donnée"
      />

      {/* Section: Piloter la feuille de route */}
      <ToolCard
        description="Des fonctionnalités pour suivre sur la feuille de route France Numérique Ensemble et les membres de la gouvernance territoriale"
        icon="/vitrine/outils/min/logo-former-acteurs.svg"
        imageAlt="Capture d'écran du pilotage de la feuille de route"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/min/visuel-fdr.png"
        reverse
        title="Piloter la feuille de route"
      />

      {/* Section: Suivre les dispositifs */}
      <ToolCard
        description="Des informations sur le déploiement des dispositifs et les financements de l'inclusion numérique"
        icon="/vitrine/outils/min/logo-identifier.svg"
        imageAlt="Capture d'écran du suivi des dispositifs"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/min/visuel-dispositifs.png"
        link="https://mon.inclusion-numerique.anct.gouv.fr/"
        title="Suivre les dispositifs"
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
              className="fr-col-12 fr-col-md-5"
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
            <div
              className="fr-col-12 fr-col-md-6"
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
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
                vous êtes invité à manifester votre
                souhait de participer à une gouvernance de l&apos;inclusion numérique sur votre
                territoire. En tant que Conseil Régional, Conseil Département ou EPCI, vous pouvez
                également porter une feuille de route.
              </p>
              <div>
                <a
                  className="fr-btn"
                  href="https://mon.inclusion-numerique.anct.gouv.fr/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Rejoindre une gouvernance
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Un outil en constante évolution */}
      <section className="fr-py-12w">
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--center">
            <div
              className="fr-col-12 fr-col-md-8"
              style={{ textAlign: 'center' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <img
                  alt=""
                  src="/vitrine/outils/min/logo-outiller.svg"
                  style={{ height: '80px', width: 'auto' }}
                />
              </div>
              <h2
                className="fr-h2"
                style={{ color: '#000091', marginBottom: '48px' }}
              >
                Un outil en constante évolution
              </h2>
            </div>
          </div>

          {/* Cartes des évolutions */}
          <div className="fr-grid-row fr-grid-row--gutters">
            {/* Ouverture aux préfectures */}
            <div className="fr-col-12 fr-col-md-4">
              <div
                className="fr-p-4w"
                style={{
                  backgroundColor: 'var(--green-tilleul-verveine-975-75)',
                  borderRadius: '8px',
                  height: '100%',
                }}
              >
                <div className="fr-mb-2w">
                  <span className="fr-badge fr-badge--sm fr-badge--new">
                    Nouveau
                  </span>
                </div>
                <h3 className="fr-h5 fr-mb-3w">
                  Ouverture aux préfectures
                </h3>
                <p className="fr-text--sm">
                  Les préfectures peuvent accéder aux premières fonctionnalités de Mon Inclusion
                  Numérique en se connectant avec ProConnect
                </p>
                <div className="fr-mt-4w">
                  <a
                    className="fr-btn fr-btn--secondary fr-btn--sm"
                    href="https://mon.inclusion-numerique.anct.gouv.fr/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Je me connecte
                  </a>
                </div>
              </div>
            </div>

            {/* Ouverture aux co-porteurs */}
            <div className="fr-col-12 fr-col-md-4">
              <div
                className="fr-p-4w"
                style={{
                  backgroundColor: 'var(--green-tilleul-verveine-975-75)',
                  borderRadius: '8px',
                  height: '100%',
                }}
              >
                <div className="fr-mb-2w">
                  <span className="fr-badge fr-badge--sm fr-badge--new">
                    Nouveau
                  </span>
                </div>
                <h3 className="fr-h5 fr-mb-3w">
                  Ouverture aux co-porteurs des feuilles de route
                </h3>
                <p className="fr-text--sm">
                  Lorem ipsum dolor sit amet consectetur. Consectetur massa sagittis consequat
                  porttitor varius id.
                </p>
                <div className="fr-mt-4w">
                  <a
                    className="fr-btn fr-btn--secondary fr-btn--sm"
                    href="https://mon.inclusion-numerique.anct.gouv.fr/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Je me connecte
                  </a>
                </div>
              </div>
            </div>

            {/* Ouverture à tous les membres */}
            <div className="fr-col-12 fr-col-md-4">
              <div
                className="fr-p-4w"
                style={{
                  backgroundColor: 'var(--blue-france-975-75)',
                  borderRadius: '8px',
                  height: '100%',
                }}
              >
                <div className="fr-mb-2w">
                  <span
                    className="fr-badge fr-badge--sm"
                    style={{
                      backgroundColor: '#E8EDFF',
                      borderRadius: '4px',
                      color: '#0063CB',
                    }}
                  >
                    À venir
                  </span>
                </div>
                <h3 className="fr-h5 fr-mb-3w">
                  Ouverture à tous les membres de la gouvernance
                </h3>
                <p className="fr-text--sm">
                  Lorem ipsum dolor sit amet consectetur. Consectetur massa sagittis consequat
                  porttitor varius id.
                </p>
                <div className="fr-mt-4w">
                  <button
                    className="fr-btn fr-btn--secondary fr-btn--sm"
                    disabled
                    type="button"
                  >
                    Je me connecte
                  </button>
                </div>
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
