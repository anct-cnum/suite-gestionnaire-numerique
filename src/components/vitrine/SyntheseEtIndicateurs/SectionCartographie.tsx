import { ReactElement } from 'react'

import styles from './SectionCartographie.module.css'
import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'

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
          alt=""
          aria-hidden="true"
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
        <h2 className={`fr-mb-0 ${styles.titre}`}>
          Voir tous les lieux <br />
          sur la cartographie
        </h2>
        <ExternalLink
          className="fr-btn fr-btn--icon-right fr-icon-external-link-line"
          href="https://cartographie.societenumerique.gouv.fr/"
          title="Voir la cartographie nationale"
        >
          Voir la cartographie nationale
        </ExternalLink>
      </div>
    </div>
  )
}
