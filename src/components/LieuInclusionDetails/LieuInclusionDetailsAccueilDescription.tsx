import { ReactElement } from 'react'

import { LieuAccueilPublicData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'

export default function LieuInclusionDetailsAccueilDescription(props: Props): ReactElement {
  const { data } = props
  const { modalitesAccueil } = data

  return (
    <div className="fr-p-4w">
      <div className="fr-grid-row fr-grid-row--middle fr-mb-2w">
        <div className="fr-col">
          <h3 className="fr-h6 fr-mb-0">
            Description du lieu
          </h3>
          <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
            Décrivez ici le lieu et les activités qu&apos;il propose.
          </p>
        </div>
        <div className="fr-col-auto">
          <button
            className="fr-btn fr-btn--sm fr-btn--secondary fr-icon-edit-line fr-btn--icon-left"
            type="button"
          >
            Modifier
          </button>
        </div>
      </div>

      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
          Typologie
        </p>
        <p className="fr-mb-0">
          Association
        </p>
      </div>

      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
          Résumé
        </p>
        <p className="fr-mb-0">
          {modalitesAccueil}
        </p>
      </div>
    </div>
  )
}

type Props = Readonly<{
  data: LieuAccueilPublicData
}>
