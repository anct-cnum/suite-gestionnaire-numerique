import { ReactElement, ReactNode } from 'react'

import { parseTextWithBold } from '../../shared/textFormatting'
import { PostesConseillerNumeriqueStatistiquesViewModel } from '@/presenters/postesConseillerNumeriquePresenter'

export default function PostesConseillerNumeriqueInfos({ statistiques }: Props): ReactElement {
  function renderInfoCard({
    description,
    indicateur,
    legends,
  }: InfoCard): ReactElement {
    return (
      <div
        className="fr-col-12 fr-col-md-4"
        style={{
          height: '7rem',
        }}
      >
        <div
          className="fr-background-alt--blue-france fr-p-2w"
          style={{
            borderRadius: '1rem',
            gap: '1rem',
            height: '7rem',
          }}
        >
          <div className="fr-h5 fr-text-title--blue-france fr-m-0">
            {indicateur}
          </div>
          <div className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-m-0">
            {description}
          </div>
          <div className="fr-text--sm fr-text-title--blue-france fr-m-0">
            {typeof legends === 'string' ? parseTextWithBold(legends) : legends}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section
      aria-labelledby="PostesConseillerNumeriqueInfo"
      className="fr-pb-3w"
    >
      <div className="fr-container-fluid">
        <div className="fr-grid-row fr-grid-row--gutters">
          {renderInfoCard({
            description: 'postes occupés',
            indicateur: statistiques.nombreDePostesOccupes,
            legends: `parmi **${statistiques.nombreDePostes} postes**`,
          })}
          {renderInfoCard({
            description: 'structures conventionnées',
            indicateur: statistiques.nombreDeStructuresConventionnees,
            legends: `pour **${statistiques.nombreDePostes} postes**`,
          })}
          {renderInfoCard({
            description: 'Budget total conventionné',
            indicateur: statistiques.budgetTotalConventionne,
            legends: `dont **${statistiques.budgetTotalVerse} versé**`,
          })}
        </div>
      </div>
    </section>
  )
}

type InfoCard = Readonly<{
  description: string
  indicateur: string
  legends: ReactNode | string
}>

type Props = Readonly<{
  statistiques: PostesConseillerNumeriqueStatistiquesViewModel
}>
