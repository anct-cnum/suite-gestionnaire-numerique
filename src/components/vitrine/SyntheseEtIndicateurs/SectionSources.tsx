import { ReactElement } from 'react'

export default function SectionSources(): ReactElement {
  return (
    <div
      className="background-blue-france fr-p-4w"
      style={{ borderRadius: '8px', textAlign: 'center' }}
    >
      <h2 className="fr-h6 color-blue-france fr-mb-3w">
        Sources et données utilisées
      </h2>
      <div
        className="fr-mb-3w"
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
        }}
      >
        <img
          alt="Logo La Coop"
          src="/vitrine/accueil/logo-coop.png"
          style={{ height: '50px', width: '50px' }}
        />
        <img
          alt="Logo Cartographie"
          src="/vitrine/accueil/logo-carto.png"
          style={{ height: '50px', width: '50px' }}
        />
        <img
          alt="Logo Aidants Connect"
          src="/vitrine/accueil/logo-aidants-connect.png"
          style={{ height: '50px', width: '50px' }}
        />
        <img
          alt="Logo Conseillers Numériques"
          src="/vitrine/accueil/logo-conseillers-numeriques.png"
          style={{ height: '50px', width: '50px' }}
        />
        <img
          alt="Logo MedNum"
          src="/vitrine/accueil/logo-mednum.png"
          style={{ height: '50px', width: '50px' }}
        />
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '7px',
            height: '50px',
            padding: '8px',
            width: '50px',
          }}
        >
          <img
            alt="Logo France Services"
            src="/vitrine/donnees-territoriales/logo-france-service.png"
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      </div>
      <p
        className="fr-text--sm fr-mb-3w"
        style={{ margin: '0 auto', maxWidth: '720px' }}
      >
        <strong>
          Mon Inclusion Numérique
        </strong>
        {' '}
        utilise et agrège plusieurs sources de données issues de plusieurs outils
        des lieux d&apos;inclusion numérique : La Coop de la médiation, La Cartographie Nationale,
        Aidants Connect, La Mednum, France Services, …
      </p>
      {/*<a*/}
      {/*  className="fr-link fr-link--icon-right fr-icon-arrow-right-line"*/}
      {/*  href="/vitrine/donnees-territoriales"*/}
      {/*>*/}
      {/*  Voir toutes les données*/}
      {/*</a>*/}
    </div>
  )
}
