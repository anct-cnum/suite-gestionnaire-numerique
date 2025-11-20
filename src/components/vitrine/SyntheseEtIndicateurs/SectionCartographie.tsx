import { ReactElement } from 'react'

export default function SectionCartographie(): ReactElement {
  return (
    <div
      style={{
        backgroundColor: '#dffee6',
        borderRadius: '8px',
        display: 'flex',
        height: '256px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          alt="Aperçu cartographie"
          src="/carte-inclusion-numerique.png"
          style={{
            height: '100%',
            objectFit: 'cover',
            width: '100%',
          }}
        />
      </div>
      <div
        style={{
          alignItems: 'flex-start',
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          gap: '24px',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <h2
          className="fr-mb-0"
          style={{
            color: '#000091',
            fontSize: '30px',
            fontWeight: 700,
            lineHeight: '36px',
          }}
        >
          Voir tous les lieux
          <br />
          sur la cartographie
        </h2>
        <a
          className="fr-btn fr-btn--icon-right fr-icon-external-link-line"
          href="https://cartographie.societenumerique.gouv.fr/"
          rel="noopener noreferrer"
          target="_blank"
        >
          La cartographie
        </a>
      </div>
    </div>
  )
}
