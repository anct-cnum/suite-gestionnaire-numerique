import { numberToPercentage, numberToString } from '../utils'
import { NoMaterialIcon } from '@/shared/pictograms/material/NoMaterialIcon'



type MaterielIconConfig =
  | { component: React.ComponentType<{ height?: number; style?: React.CSSProperties; width?: number }>; type: 'svg' }
  | { icon: string; rotation?: number; type: 'dsfr' }

const materielIcons: Record<string, MaterielIconConfig> = {
  Aucun: { component: NoMaterialIcon, type: 'svg' },
  Autre: { icon: 'fr-icon-install-line', type: 'dsfr' },
  AutreMateriel: { icon: 'fr-icon-remote-control-line', type: 'dsfr' },
  Ordinateur: { icon: 'fr-icon-computer-line', type: 'dsfr' },
  Tablette: { icon: 'fr-icon-tablet-line', rotation: -90, type: 'dsfr' },
  Telephone: { icon: 'fr-icon-smartphone-line', type: 'dsfr' },
}

export function StatistiqueMateriel({
  className,
  count,
  label,
  proportion,
  value,
}: {
  readonly className?: string
  readonly count: number
  readonly label: string
  readonly proportion: number
  readonly value: string
}) {
  const materialConfig = materielIcons[value] || { icon: 'fr-icon-device-line', type: 'dsfr' }

  return (
    <div className={className}>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          aria-hidden
          className="fr-background-alt--blue-france fr-border-radius--8"
          style={{
            display: 'inline-flex',
            marginBottom: '12px',
            padding: '16px',
          }}
        >
          {materialConfig.type === 'svg' ? (
            <materialConfig.component
              height={32}
              style={{ color: 'var(--text-label-blue-france)' }}
              width={32}
            />
          ) : (
            <span
              className={`${materialConfig.icon} fr-text-label--blue-france`}
              style={{
                display: 'inline-block',
                fontSize: '2rem',
                lineHeight: 1,
                ...'rotation' in materialConfig && materialConfig.rotation
                  ? { transform: `rotate(${materialConfig.rotation}deg)` }
                  : {},
              }}
            />
          )}
        </div>
        <div>
          <span className="fr-text--bold">
            {numberToString(count)}
          </span>
          {' '}
          <span className="fr-text-mention--grey">
            {numberToPercentage(proportion)}
          </span>
        </div>
        <div className="fr-text--sm">
          {label}
        </div>
      </div>
    </div>
  )
}
