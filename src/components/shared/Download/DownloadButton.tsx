import React from 'react'

export function DownloadButton({ 
  onClick,
  title,
}: DownloadButtonProps): React.ReactElement {
  return (
    <div>
      <button
        className="fr-btn fr-btn--tertiary fr-btn--icon-only fr-icon-download-line fr-icon--xs"
        onClick={onClick}
        style={{
          alignItems: 'center',
          color: 'var(--text-mention-grey)',
          display: 'flex',
          height: '32px',
          justifyContent: 'center',
          minHeight: '32px',
          width: '32px',
        }}
        title={title}
        type="button"
      >
        <span className="fr-sr-only">
          {`Télécharger le graphique${  title}`}
        </span>
      </button>
    </div>
  )
}

type DownloadButtonProps = Readonly<{
  onClick(): void
  title: string
}>