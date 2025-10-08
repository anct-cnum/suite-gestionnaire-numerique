import { ReactElement } from 'react'

import { ServiceInclusionNumeriqueData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'

export default function LieuInclusionDetailsServicesTypeAccompagnement(props: Props): ReactElement {
  const { data } = props

  const allThematiques = data.flatMap(service => service.thematiques)
  const uniqueThematiques = [...new Set(allThematiques)]

  const typeAccompagnements = [
    {
      icon: 'fr-icon-user-line',
      label: 'Accompagnement individuel',
    },
    {
      icon: 'fr-icon-team-line',
      label: 'Atelier collectif',
    },
    {
      icon: 'fr-icon-checkbox-circle-line',
      label: 'En autonomie',
    },
    {
      icon: 'fr-icon-computer-line',
      label: 'À distance',
    },
  ]

  return (
    <div className="fr-px-4w fr-pb-2w">
      <div className="fr-grid-row fr-grid-row--gutters fr-pb-2w">
        <div className="fr-col fr-col-12 fr-col-md-8">
          <h4 className="fr-h6 fr-mb-1v">
            Services & types d&apos;accompagnement
          </h4>
          <p
            className="fr-text--sm fr-mb-2w"
            style={{ color: 'var(--grey-425-625)' }}
          >
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
        <h5
          className="fr-text--md fr-mb-1w"
          style={{ color: 'var(--grey-50-1000)' }}
        >
          Types d&apos;accompagnements proposés
        </h5>
        <div className="fr-tags-group">
          {typeAccompagnements.map((type) => (
            <div
              className="fr-tag"
              key={type.label}
              style={{
                backgroundColor: 'var(--blue-france-975-75)',
                fontSize: '1.125rem',
                padding: '0.75rem 1rem',
              }}
            >
              <span
                className={`${type.icon} fr-icon--lg fr-mr-1v`}
                style={{ color: 'var(--blue-france-sun-113-625)' }}
              />
              {type.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  data: ReadonlyArray<ServiceInclusionNumeriqueData>
}>
