import { ReactElement, useId } from 'react'

export default function Information({ children }: Props): ReactElement {
  const id = useId().replace(/:/g, '')

  return (
    <span
      className="fr-ml-1w"
      style={{ display: 'inline-block', position: 'relative' }}
    >
      <span
        aria-describedby={id}
        className="fr-icon fr-icon-information-line fr-p-0 fr-btn--sm color-blue-france"
        role="img"
      />

      <span
        aria-hidden="true"
        className="fr-tooltip fr-placement--top"
        id={id}
        role="tooltip"
        style={{
          boxShadow: 'var(--shadow-lg)',
          filter: 'drop-shadow(0 6px 16px rgba(0, 0, 18, 0.24))',
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
  children: ReactElement
}>
