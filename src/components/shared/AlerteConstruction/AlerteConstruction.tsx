import { ReactElement } from 'react'

export default function AlerteConstruction({ className = '' }: Props): ReactElement {
  return (
    <div className={`fr-mb-4w ${className}`}>
      <div className="fr-alert fr-alert--error fr-mb-4w">
        <p className="fr-alert__title">
          🚧 Page en construction
        </p>
        <p>
          Cette page est actuellement en développement. Les données présentées ne correspondent pas à la
          réalité et sont uniquement à des fins de démonstration.
        </p>
      </div>
    </div>
  )
}

type Props = Readonly<{
  className?: string
}>