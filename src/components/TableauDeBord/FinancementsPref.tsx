import Link from 'next/link'
import { ReactElement } from 'react'

import BlocCard from './BlocCard'
import EnveloppesConseillerNumerique from './EnveloppesConseillerNumerique'
import styles from './TableauDeBord.module.css'
import VentilationFinancements from './VentilationFinancements'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { EnveloppeConseillerNumeriqueViewModel } from '@/presenters/tableauDeBord/enveloppesConseillerNumeriquePresenter'
import { FinancementViewModel } from '@/presenters/tableauDeBord/financementPrefPresenter'

export default function FinancementsPref({
  conventionnement,
  enveloppesConseillerNumerique,
  lienFinancements,
}: Props): ReactElement {
  if (isErrorViewModel(conventionnement)) {
    return (
      <BlocCard labelledBy="conventionnements">
        <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-2w">
          <div className="fr-grid-row fr-grid-row--middle">
            <TitleIcon icon="pen-nib-line" size="medium-large" />
            <div>
              <h2 className="fr-h4 color-blue-france fr-m-0" id="conventionnements">
                Financements
              </h2>
              <p className="fr-m-0 fr-text--md fr-mb-0" style={{ fontWeight: 500 }}>
                Chiffres clés des budgets et financements
              </p>
            </div>
          </div>
          <Link className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line" href={lienFinancements}>
            Les demandes en cours
          </Link>
        </div>
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <TitleIcon background="white" icon="error-warning-line" />
            <div className="fr-text--sm color-blue-france fr-mt-2w">{conventionnement.message}</div>
          </div>
        </div>
      </BlocCard>
    )
  }

  return (
    <BlocCard labelledBy="conventionnements">
      <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-2w">
        <div className="fr-grid-row fr-grid-row--middle">
          <TitleIcon icon="pen-nib-line" />
          <div>
            <h2 className="fr-h4 color-blue-france fr-m-0" id="conventionnements">
              Financements
            </h2>
            <p className="fr-m-0 fr-text--md" style={{ fontWeight: 500 }}>
              Chiffres clés des budgets et financements
            </p>
          </div>
        </div>
        <Link className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line" href={lienFinancements}>
          Les demandes en cours
        </Link>
      </div>
      <div className="fr-grid-row fr-mb-4w">
        <div className="fr-col background-blue-france fr-p-3w fr-mr-4w">
          <div className={`${styles.indicateurValeur} fr-m-0`}>
            <TitleIcon background="white" icon="download-line" />
            {conventionnement.fneEngage}
          </div>
          <div className="fr-text--md fr-mb-0 fr-grid-row fr-grid-row--middle" style={{ fontWeight: 500 }}>
            Financements FNE engagés par l&apos;État
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            sur <span style={{ fontWeight: 700 }}>{conventionnement.budgetGlobalRenseigne}</span> de votre budget global
            renseigné
          </div>
        </div>
        <div className="fr-col background-blue-france fr-p-3w">
          <div className={`${styles.indicateurValeur} fr-m-0`}>
            <TitleIcon background="white" icon="upload-line" />
            {conventionnement.conseillerNumerique.verse}
          </div>
          <div className="fr-text--md fr-mb-0 fr-grid-row fr-grid-row--middle" style={{ fontWeight: 500 }}>
            Financements Conseiller Numérique versés
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            sur <span style={{ fontWeight: 700 }}>{conventionnement.conseillerNumerique.conventionne}</span>{' '}
            conventionnés sur les postes liés à la gouvernance
          </div>
        </div>
      </div>
      <VentilationFinancements
        contexte="departement"
        nombreDeFinancementsEngagesParLEtat={conventionnement.nombreDeFinancementsEngagesParLEtat}
        ventilationSubventionsParEnveloppe={conventionnement.ventilationSubventionsParEnveloppe}
      />
      {enveloppesConseillerNumerique !== undefined && enveloppesConseillerNumerique.length > 0 && (
        <EnveloppesConseillerNumerique contexte="departement" enveloppes={enveloppesConseillerNumerique} />
      )}
    </BlocCard>
  )
}

function isErrorViewModel(viewModel: ErrorViewModel | FinancementViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  conventionnement: ErrorViewModel | FinancementViewModel
  enveloppesConseillerNumerique?: ReadonlyArray<EnveloppeConseillerNumeriqueViewModel>
  lienFinancements: string
}>
