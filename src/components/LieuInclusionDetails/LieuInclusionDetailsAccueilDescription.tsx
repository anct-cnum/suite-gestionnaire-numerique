import { ReactElement } from 'react'

import { LieuAccueilPublicData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'

export default function LieuInclusionDetailsAccueilDescription(props: Props): ReactElement {
  const { data } = props
  const { modalitesAccueil, presentationDetail, presentationResume, typologies } = data

  let typologieLabel = 'Non renseigné'
  if (typologies && typologies.length > 0) {
    typologieLabel = typologies.includes('ASSO') ? 'Association' : typologies[0]
  }

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
        <div className="fr-col-auto" />
      </div>

      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
          Typologie
        </p>
        <p className="fr-mb-0">
          {typologieLabel}
        </p>
      </div>

      {presentationDetail !== undefined && presentationDetail !== '' && (
        <div className="fr-mb-2w">
          <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
            Présentation
          </p>
          <p className="fr-mb-0">
            {presentationDetail}
          </p>
        </div>
      )}

      <div className="fr-mb-2w">
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
          Résumé
        </p>
        <p className="fr-mb-0">
          {presentationResume ?? modalitesAccueil ?? 'Aucune description disponible'}
        </p>
      </div>
    </div>
  )
}

type Props = Readonly<{
  data: LieuAccueilPublicData
}>
