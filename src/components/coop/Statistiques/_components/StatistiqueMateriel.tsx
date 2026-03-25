import { materielIcons, Materiel } from '../mappings'
import { numberToPercentage, numberToString } from '../utils'
import classNames from 'classnames'

const defaultIcon = { icon: 'ri-question-line' }

export const StatistiqueMateriel = ({
  label,
  value,
  count,
  proportion,
  className,
}: {
  label: string
  value: string
  count: number
  proportion: number
  className?: string
}) => {
  const iconConfig = value in materielIcons ? materielIcons[value as Materiel] : defaultIcon

  return (
    <div className={classNames('fr-text--center fr-text--sm fr-mb-0', className)}>
      <div
        className="fr-background-alt--blue-france fr-p-3v fr-mb-3v fr-border-radius--8 fr-display-inline-block"
        aria-hidden
      >
        <div
          style={
            'rotation' in iconConfig && iconConfig.rotation
              ? { transform: `rotate(${iconConfig.rotation}deg)` }
              : {}
          }
          className={`${iconConfig.icon} ri-2x fr-line-height-1 fr-text-label--blue-france`}
        />
      </div>
      <div className="fr-flex fr-flex-gap-2v fr-justify-content-center fr-text--nowrap">
        <span className="fr-text--bold">{numberToString(count)}</span>
        <span className="fr-text-mention--grey">
          {numberToPercentage(proportion)}
        </span>
      </div>
      {label}
    </div>
  )
}
