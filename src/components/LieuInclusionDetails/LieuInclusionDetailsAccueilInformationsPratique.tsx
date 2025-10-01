import { ReactElement } from 'react'

import { LieuAccueilPublicData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import HorairesOuverture from '@/shared/components/HorairesOuverture/HorairesOuverture'

export default function LieuInclusionDetailsAccueilInformationsPratique(props: Props): ReactElement {
  const { data } = props
  const { horaires, itinerance, priseRdvUrl, websiteUrl } = data

  return (
    <div className="fr-p-4w">
      <div className="fr-grid-row fr-grid-row--middle fr-mb-2w ">
        <div className="fr-col">
          <h3 className="fr-h6 fr-mb-0">
            Informations pratiques
          </h3>
          <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
            Horaires, accès et site internet du lieu
          </p>
        </div>
        <div className="fr-col-auto" />
      </div>

      {websiteUrl !== undefined && websiteUrl !== '' ? (
        <div className="fr-mb-2w">
          <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
            Site internet du lieu
          </p>
          <a
            className="fr-link"
            href={websiteUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {websiteUrl}
          </a>
        </div>
      ) : null}

      {itinerance !== undefined && itinerance.length > 0 && (
        <div className="fr-mb-2w">
          <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
            Itinérance
          </p>
          <div className="fr-tags-group">
            {itinerance.map((item) => (
              <span
                className="fr-tag fr-tag--sm"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        className="fr-mb-2w"
        style={{ display: 'none' }}
      >
        <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
          Accessibilité
        </p>
        <a
          className="fr-link"
          href="https://"
          rel="noopener noreferrer"
          target="_blank"
        >
          Retrouvez les informations d&apos;accessibilité via ce lien
        </a>
      </div>

      {priseRdvUrl !== undefined && priseRdvUrl !== '' && (
        <div className="fr-mb-2w">
          <p className="fr-text--sm fr-mb-1v fr-text-mention--grey">
            Prise de rendez-vous en ligne
          </p>
          <a
            className="fr-link"
            href={priseRdvUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Prendre rendez-vous en ligne via ce lien
          </a>
        </div>
      )}

      <HorairesOuverture horaires={horaires} />
    </div>
  )
}

type Props = Readonly<{
  data: LieuAccueilPublicData
}>
