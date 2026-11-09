import { ReactElement, ReactNode, useId } from 'react'

export default function Information({ children, libelle }: Props): ReactElement {
  const id = useId().replace(/:/g, '')

  return (
    <span className="fr-ml-1v" style={{ display: 'inline-block', position: 'relative' }}>
      <button
        aria-describedby={id}
        className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-information-line"
        type="button"
      >
        {libelle}
      </button>

      <span
        aria-hidden="true"
        className="fr-tooltip fr-placement--top"
        id={id}
        role="tooltip"
        style={{
          boxShadow: 'var(--shadow-lg)',
          filter: 'drop-shadow(0 6px 16px rgba(0, 0, 18, 0.24))',
          fontSize: '1rem',
          fontWeight: 'normal',
          position: 'absolute',
          width: 'max-content',
          zIndex: 99999,
        }}
      >
        {children}
      </span>
    </span>
  )
}

type Props = Readonly<{
  children: ReactNode
  // Nom accessible du bouton déclencheur, ex. « Plus d'information sur l'indice de fragilité numérique »
  libelle: string
}>
