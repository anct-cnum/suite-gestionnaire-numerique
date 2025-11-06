import { ReactElement } from 'react'

import { InformationsGeneralesData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import styles from '@/components/LieuInclusionDetails/LieuInclusionDetailsShared.module.css'

export default function LieuInclusionDetailsInformationsGenerales(props: Props): ReactElement {
  const { data } = props

  return (
    <section className="fr-mb-4w grey-border border-radius ">
      <div className="fr-grid-row fr-grid-row--middle fr-p-4w">
        <div className="fr-col">
          <h2 className="fr-h4 fr-mb-0 fr-text-label--blue-france">
            Informations générales
          </h2>
        </div>
        <div className="fr-col-auto" />
      </div>

      <hr className="fr-hr fr-mb-1w" />
      <div className="fr-px-4w">
        <div className="fr-mb-4v ">
          <h3 className={`fr-text--regular fr-text--sm fr-mb-1v ${styles.subtitleGrey}`}>
            Nom de la structure
          </h3>
          <p className="fr-text--bold fr-mb-0">
            {data.nomStructure}
          </p>
        </div>

        <div className="fr-mb-4v">
          <h3 className={`fr-text--regular fr-text--sm fr-mb-1v ${styles.subtitleGrey}`}>
            Adresse
          </h3>
          <p className="fr-text--bold fr-mb-0">
            {data.adresse}
          </p>
        </div>

        <div className="fr-mb-4v">
          <h3 className={`fr-text--regular fr-text--sm fr-mb-1v ${styles.subtitleGrey}`}>
            Complément d&apos;adresse
          </h3>
          <p className="fr-text--bold fr-mb-0">
            {data.complementAdresse ?? 'Non renseigné'}
          </p>
        </div>

        <div className="fr-mb-4v">
          <h3 className={`fr-text--regular fr-text--sm fr-mb-1v ${styles.subtitleGrey}`}>
            SIRET structure (ou RNA)
          </h3>
          <p className="fr-text--bold fr-mb-0">
            {data.siret}
          </p>
        </div>
      </div>
    </section>
  )
}

type Props = Readonly<{
  data: InformationsGeneralesData
}>
