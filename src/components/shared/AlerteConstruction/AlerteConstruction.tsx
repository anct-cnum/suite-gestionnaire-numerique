import { ReactElement } from 'react'

export default function AlerteConstruction({ className = '' }: Props): ReactElement {
  return (
    <div className={`fr-mb-4w ${className}`}>
      <div className="fr-alert fr-alert--error fr-mb-4w">
        <p className="fr-alert__title">
          🚧 Page en construction
        </p>
        <p>
          Cette page est en cours de développement. Les données affichées peuvent ne pas être
          correctes.
        </p>
      </div>
    </div>
  )
}

type Props = Readonly<{
  className?: string
}>
