import { ReactElement } from 'react'

function SpinnerSimple({ 
  size = 'medium',
  text = 'Chargement...',
}: { 
  readonly size?: 'large' | 'medium' | 'small'
  readonly text?: string
}): ReactElement {
  const sizes = {
    large: { borderWidth: '4px', height: '32px', width: '32px' },
    medium: { borderWidth: '3px', height: '24px', width: '24px' },
    small: { borderWidth: '2px', height: '16px', width: '16px' },
  }
  
  const currentSize = sizes[size]
  
  return (
    <div className="fr-grid-row fr-grid-row--center fr-py-3w">
      <div className="fr-grid-row fr-grid-row--middle">
        <div
          aria-label={text}
          role="status"
          style={{
            animation: 'dsfr-spin 1s linear infinite',
            border: `${currentSize.borderWidth} solid var(--border-default-grey, #ddd)`,
            borderRadius: '50%',
            borderTop: `${currentSize.borderWidth} solid var(--text-action-high-blue-france, #000091)`,
            height: currentSize.height,
            marginRight: '8px',
            width: currentSize.width,
          }}
        />
        <span 
          className="fr-text--sm fr-mb-0"
        >
          {text}
        </span>
      </div>
      <style>
        {`
        @keyframes dsfr-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
      </style>
    </div>
  )
}

SpinnerSimple.defaultProps = {
  size: 'medium',
  text: 'Chargement...',
}

export default SpinnerSimple