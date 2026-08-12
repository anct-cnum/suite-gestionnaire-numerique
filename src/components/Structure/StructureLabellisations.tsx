import { ReactElement } from 'react'

import PastilleLabelisation from '../shared/PastilleLabelisation/PastilleLabelisation'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function StructureLabellisations({ labellisations }: Props): ReactElement {
  const { estHabiliteeAidantsConnect, labelConum } = labellisations

  return (
    <section aria-labelledby="labellisation" className="grey-border border-radius fr-mb-2w fr-p-4w">
      <header className="separator fr-mb-2w">
        <h2 className="fr-h6 fr-mb-2w" id="labellisation" style={{ scrollMarginTop: '56px' }}>
          Habilitation et labellisation de la structure
        </h2>
      </header>
      {labelConum === undefined ? null : (
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
          <span>
            <PastilleLabelisation className="fr-mr-1w" labelisation="conseiller numérique" />
            Label conseiller numérique
          </span>
          <p
            className={`fr-badge fr-badge--no-icon fr-badge--sm fr-m-0${labelConum.estActif ? ' fr-badge--success' : ''}`}
          >
            {labelConum.statut}
          </p>
        </div>
      )}
      {estHabiliteeAidantsConnect ? (
        <div
          className={labelConum === undefined ? '' : 'fr-mt-2w'}
          style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}
        >
          <span>
            <PastilleLabelisation className="fr-mr-1w" labelisation="aidants connect" />
            Habilitation Aidants Connect
          </span>
          <p className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--success fr-m-0">Actif</p>
        </div>
      ) : null}
    </section>
  )
}

type Props = Readonly<{
  labellisations: StructureViewModel['labellisations']
}>
