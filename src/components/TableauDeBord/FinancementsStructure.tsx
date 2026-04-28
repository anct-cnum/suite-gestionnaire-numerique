'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import BlocCard from './BlocCard'
import EnveloppesConseillerNumerique from './EnveloppesConseillerNumerique'
import styles from './TableauDeBord.module.css'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { EnveloppeConseillerNumeriqueViewModel } from '@/presenters/tableauDeBord/enveloppesConseillerNumeriquePresenter'
import { FinancementsStructureViewModel } from '@/presenters/tableauDeBord/financementsStructurePresenter'

const COULEUR_VIDE = '#DDDDDD'

export default function FinancementsStructure({
  enveloppesConseillerNumerique,
  lienFinancements,
  viewModel,
}: Props): ReactElement {
  if (isErrorViewModel(viewModel)) {
    return (
      <BlocCard labelledBy="financements-structure">
        <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-2w">
          <div className="fr-grid-row fr-grid-row--middle">
            <TitleIcon icon="pen-nib-line" />
            <div>
              <h2 className="fr-h4 color-blue-france fr-m-0" id="financements-structure">
                Financements
              </h2>
              <p className="fr-m-0 fr-text--md fr-mb-0" style={{ fontWeight: 500 }}>
                Chiffres clés de vos financements
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
            <div className="fr-text--sm color-blue-france fr-mt-2w">{viewModel.message}</div>
          </div>
        </div>
      </BlocCard>
    )
  }

  const aDesFinancements = viewModel.ventilationSubventionsParEnveloppe.length > 0
  const backgroundColor = aDesFinancements
    ? viewModel.ventilationSubventionsParEnveloppe.map((detail) => detail.couleurGraphique)
    : [COULEUR_VIDE]
  const data = aDesFinancements ? viewModel.ventilationSubventionsParEnveloppe.map((detail) => detail.montant) : [1]
  const labels = viewModel.ventilationSubventionsParEnveloppe.map((detail) => detail.label)
  const { nombreDeFinancementsEngagesParLEtat } = viewModel

  return (
    <BlocCard labelledBy="financements-structure">
      <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-3w fr-mb-3w separator">
        <div className="fr-grid-row fr-grid-row--middle">
          <TitleIcon icon="pen-nib-line" />
          <div>
            <h2 className="fr-h4 color-blue-france fr-m-0" id="financements-structure">
              Financements
            </h2>
            <p className="fr-m-0 fr-text--md" style={{ fontWeight: 500 }}>
              Chiffres clés de vos financements
            </p>
          </div>
        </div>
        <Link className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line" href={lienFinancements}>
          Les demandes en cours
        </Link>
      </div>
      <div className="fr-grid-row">
        <div className={`fr-col-4 fr-mr-4w fr-pr-4w ${styles.separator} center`}>
          <div>
            <Doughnut backgroundColor={backgroundColor} data={data} isFull={false} labels={labels} />
          </div>
          <div className={`fr-h3 fr-mb-1w color-blue-france ${styles['remonter-donnee']}`}>
            {viewModel.totalFinancements}
          </div>
          <div className="fr-text--sm fr-mb-0" style={{ fontWeight: 500 }}>
            Financements engagés par l&apos;État
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            comprenant{' '}
            <span style={{ fontWeight: 700 }}>
              {nombreDeFinancementsEngagesParLEtat} financement
              {nombreDeFinancementsEngagesParLEtat > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="fr-col">
          <div style={{ fontWeight: 500 }}>Dont</div>
          <ul>
            {viewModel.ventilationSubventionsParEnveloppe.map((detail) => (
              <li
                className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
                key={detail.label}
                style={{ listStyle: 'none' }}
              >
                <div>
                  <Dot color={detail.color} /> {detail.label}
                </div>
                <div style={{ fontWeight: 700 }}>{detail.total}</div>
              </li>
            ))}
          </ul>
          {enveloppesConseillerNumerique !== undefined && enveloppesConseillerNumerique.length > 0 && (
            <EnveloppesConseillerNumerique contexte="departement" enveloppes={enveloppesConseillerNumerique} />
          )}
        </div>
      </div>
    </BlocCard>
  )
}

function isErrorViewModel(viewModel: ErrorViewModel | FinancementsStructureViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  enveloppesConseillerNumerique?: ReadonlyArray<EnveloppeConseillerNumeriqueViewModel>
  lienFinancements: string
  viewModel: ErrorViewModel | FinancementsStructureViewModel
}>
