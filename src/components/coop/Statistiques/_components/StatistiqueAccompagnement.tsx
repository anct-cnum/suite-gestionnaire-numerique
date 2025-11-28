import { ReactNode } from 'react'

import { numberToPercentage, numberToString } from '../utils'
import { SittingAtATableIcon } from '@/shared/pictograms/user/SittingAtATableIcon'
import { TeacherIcon } from '@/shared/pictograms/user/TeacherIcon'

type TypeActivite = 'Collectif' | 'Individuel'

const typeActiviteIcons: Record<TypeActivite, React.ComponentType<{ height?: number; width?: number }>> = {
  Collectif: TeacherIcon,
  Individuel: SittingAtATableIcon,
}

const typeActivitePluralLabels: Record<TypeActivite, string> = {
  Collectif: 'Ateliers collectifs',
  Individuel: 'Accompagnements individuels',
}

export function StatistiqueAccompagnement({
  children,
  className,
  count,
  proportion,
  typeActivite,
}: {
  readonly children?: ReactNode
  readonly className?: string
  readonly count: number
  readonly proportion: number
  readonly typeActivite: string
}) {
  const IconComponent = typeActiviteIcons[typeActivite as TypeActivite]

  return (
    <div
      className={className}
      style={{
        alignItems: 'center',
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        gap: '16px',
      }}
    >
      {/* Icône à gauche */}
      <div
        aria-hidden
        className="fr-border-radius--8 fr-background-default--grey"
        style={{
          display: 'inline-flex',
          padding: '8px',
        }}
      >
        {IconComponent ? (
          <IconComponent
            height={56}
            width={56}
          />
        ) : (
          <div
            style={{
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              height: '56px',
              width: '56px',
            }}
          />
        )}
      </div>

      {/* Contenu à droite */}
      <div>
        {/* Ligne 1 : Chiffre + pourcentage */}
        <div className="fr-flex fr-direction-row fr-align-items-baseline">
          <span className="fr-h4 fr-mb-0">
            {numberToString(count ?? 0)}
          </span>
          <span className="fr-ml-2v fr-text--sm fr-mb-0 fr-text-mention--grey">
            {numberToPercentage(proportion)}
          </span>
          {children}
        </div>

        {/* Ligne 2 : Légende */}
        <div className="fr-text--sm fr-mb-0">
          {typeActivitePluralLabels[typeActivite as TypeActivite] || typeActivite}
        </div>
      </div>
    </div>
  )
}
