import { ReactElement } from 'react'

import { ServiceInclusionNumeriqueData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'

export default function LieuInclusionDetailsServicesTypeAccompagnement(props: Props): ReactElement {
  const { data } = props

  const allThematiques = data.flatMap(service => service.thematiques)
  const uniqueThematiques = [...new Set(allThematiques)]

  const typeAccompagnementLabels = [
    'Accompagnement individuel',
    'Atelier collectif',
    'En autonomie',
    'À distance',
  ]

  return (
    <div className="fr-px-4w fr-pb-2w">
      <div className="fr-grid-row fr-grid-row--gutters fr-pb-2w">
        <div className="fr-col fr-col-12 fr-col-md-8">
          <h4 className="fr-h6 fr-mb-1v">
            Services & types d&apos;accompagnement
          </h4>
          <p className="fr-text--sm fr-mb-2w">
            Renseigner les les services et les types d&apos;accompagnements proposés dans ce lieu.
          </p>
        </div>
        <div className="fr-col fr-col-12 fr-col-md-4">
          <div className="fr-grid-row fr-grid-row--right" />
        </div>
      </div>

      <div className="fr-mb-3w">
        <h5 className="fr-text--md fr-mb-1w">
          Thématiques des services d&apos;inclusion numérique
        </h5>
        <p className="fr-text--sm fr-mb-2w">
          Renseigner les services proposés dans ce lieu.
        </p>
        <ul>
          {uniqueThematiques.map((thematique) => (
            <li
              key={thematique}
            >
              •
              {' '}
              {thematique}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h5 className="fr-text--md fr-mb-1w">
          Types d&apos;accompagnements proposés
        </h5>
        <div className="fr-tags-group">
          {typeAccompagnementLabels.map((label) => (
            <span
              className="fr-tag fr-text--xl"
              key={label}
              style={{ backgroundColor: 'var(--blue-france-975-75)' }}
            >
              <span className="fr-icon-user-line fr-icon--xl fr-mr-1v" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  data: ReadonlyArray<ServiceInclusionNumeriqueData>
}>
