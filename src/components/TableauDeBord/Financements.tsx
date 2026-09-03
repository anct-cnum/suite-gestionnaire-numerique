'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import BlocCard from './BlocCard'
import EnveloppesConseillerNumerique from './EnveloppesConseillerNumerique'
import styles from './TableauDeBord.module.css'
import VentilationFinancements from './VentilationFinancements'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import TableauVide from '../shared/TableauVide/TableauVide'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { FinancementsViewModel } from '@/presenters/tableauDeBord/financementsPresenter'

// Encart Financements unique pour tous les dashboards (#1557) : le contenu affiché
// dépend uniquement du view model (vide / vue simple / vue détaillée), jamais du dashboard.
export default function Financements({ lienFinancements, porteeVide, sousTitre, viewModel }: Props): ReactElement {
  const enTeteAvecSeparateur = !isErrorViewModel(viewModel) && viewModel.vue === 'simple'

  return (
    <BlocCard labelledBy="financements">
      <div
        className={`fr-grid-row fr-grid-row--middle space-between ${
          enTeteAvecSeparateur ? 'fr-pb-3w fr-mb-3w separator' : 'fr-pb-2w'
        }`}
      >
        <div className="fr-grid-row fr-grid-row--middle">
          <TitleIcon icon="pen-nib-line" />
          <div>
            <h2 className="fr-h4 color-blue-france fr-m-0" id="financements">
              Financements
            </h2>
            <p className="fr-m-0 fr-text--md" style={{ fontWeight: 500 }}>
              {sousTitre}
            </p>
          </div>
        </div>
        {lienFinancements !== undefined && (
          <Link
            className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
            href={lienFinancements.href}
          >
            {lienFinancements.libelle}
          </Link>
        )}
      </div>
      {corps(viewModel, porteeVide)}
    </BlocCard>
  )
}

function corps(viewModel: ErrorViewModel | FinancementsViewModel, porteeVide: string): ReactElement {
  if (isErrorViewModel(viewModel)) {
    return (
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <TitleIcon background="white" icon="error-warning-line" />
          <div className="fr-text--sm color-blue-france fr-mt-2w">{viewModel.message}</div>
        </div>
      </div>
    )
  }

  switch (viewModel.vue) {
    case 'detaillee':
      return vueDetaillee(viewModel)
    case 'simple':
      return vueSimple(viewModel)
    default:
      return (
        <TableauVide variante="bleuFrance">
          <span className="fr-text--bold">👻 Aucun financement trouvé</span>
          {` ${porteeVide}`}
        </TableauVide>
      )
  }
}

function vueSimple(viewModel: Extract<FinancementsViewModel, { vue: 'simple' }>): ReactElement {
  return (
    <div className="fr-grid-row">
      <div className={`fr-col-4 fr-mr-4w fr-pr-4w ${styles.separator} center`}>
        <div className={styles['demi-doughnut']}>
          <Doughnut
            backgroundColor={viewModel.ventilation.map((detail) => detail.couleurGraphique)}
            data={viewModel.ventilation.map((detail) => detail.montant)}
            isFull={false}
            labels={viewModel.ventilation.map((detail) => detail.label)}
          />
        </div>
        <div className={`fr-h3 fr-mb-1w color-blue-france ${styles['remonter-donnee']}`}>
          {viewModel.totalFinancements}
        </div>
        <div className="fr-text--sm fr-mb-0" style={{ fontWeight: 500 }}>
          Financements engagés par l&apos;État
        </div>
      </div>
      <div className="fr-col">
        <div style={{ fontWeight: 500 }}>Dont</div>
        <ul>
          {viewModel.ventilation.map((detail) => (
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
      </div>
    </div>
  )
}

function vueDetaillee(viewModel: Extract<FinancementsViewModel, { vue: 'detaillee' }>): ReactElement {
  return (
    <>
      <div className="fr-grid-row fr-mb-4w">
        <div className="fr-col background-blue-france fr-p-3w fr-mr-4w">
          <div className={`${styles.indicateurValeur} fr-m-0`}>
            <TitleIcon background="white" icon="download-line" />
            {viewModel.fne.engage}
          </div>
          <div className="fr-text--md fr-mb-0 fr-grid-row fr-grid-row--middle" style={{ fontWeight: 500 }}>
            Financements FNE engagés par l&apos;État
          </div>
          {viewModel.fne.reference !== undefined && (
            <div className="fr-text--xs color-blue-france fr-mb-0">
              sur <span style={{ fontWeight: 700 }}>{viewModel.fne.reference.montant}</span>{' '}
              {viewModel.fne.reference.libelle}
            </div>
          )}
        </div>
        <div className="fr-col background-blue-france fr-p-3w">
          <div className={`${styles.indicateurValeur} fr-m-0`}>
            <TitleIcon background="white" icon="upload-line" />
            {viewModel.conseillerNumerique.verse}
          </div>
          <div className="fr-text--md fr-mb-0 fr-grid-row fr-grid-row--middle" style={{ fontWeight: 500 }}>
            Financements Conseiller Numérique versés
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            sur <span style={{ fontWeight: 700 }}>{viewModel.conseillerNumerique.conventionne}</span>{' '}
            {viewModel.conseillerNumerique.complementConventionne}
          </div>
        </div>
      </div>
      <VentilationFinancements
        jauges={viewModel.jauges}
        nombreDeFinancementsEngagesParLEtat={viewModel.nombreDeFinancementsEngagesParLEtat}
        noteMethodologique={viewModel.noteMethodologique}
        ventilationSubventionsParEnveloppe={viewModel.ventilationFne}
      />
      {viewModel.enveloppesConseillerNumerique.length > 0 && (
        <EnveloppesConseillerNumerique enveloppes={viewModel.enveloppesConseillerNumerique} jauges={viewModel.jauges} />
      )}
    </>
  )
}

function isErrorViewModel(viewModel: ErrorViewModel | FinancementsViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  lienFinancements?: Readonly<{
    href: string
    libelle: string
  }>
  porteeVide: string
  sousTitre: string
  viewModel: ErrorViewModel | FinancementsViewModel
}>
