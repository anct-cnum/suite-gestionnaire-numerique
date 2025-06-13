import Link from 'next/link'
import { ReactElement } from 'react'

import Dot from '../shared/Dot/Dot'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { TableauDeBordViewModel } from '@/presenters/tableauDeBordPresenter'

export default function Conventionnement({ conventionnement, lienFinancements }: Props) : ReactElement {
  return (
    <section
      aria-labelledby="conventionnements"
      className="fr-mb-4w grey-border border-radius fr-p-4w"
    >
      <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-2w">
        <div className="fr-grid-row fr-grid-row--middle">
          <TitleIcon icon="pen-nib-line" />
          <div>
            <h2
              className="fr-h4 color-blue-france fr-m-0"
              id="conventionnements"
            >
              Conventionnements et financements
            </h2>
            <p className="fr-m-0 font-weight-500">
              Chiffres clés des budgets et financements
            </p>
          </div>
        </div>
        <Link
          className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
          href={lienFinancements}
        >
          Les demandes
        </Link>
      </div>
      <div className="fr-grid-row fr-mb-4w">
        <div className="fr-col background-blue-france fr-p-4w fr-mr-4w">
          <div className="fr-h1 fr-m-0">
            <TitleIcon
              background="white"
              icon="money-euro-circle-line"
            />
            {conventionnement.budget.total}
          </div>
          <div className="font-weight-500">
            Budget global renseigné
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            pour
            {' '}
            <span className="font-weight-700">
              {conventionnement.budget.feuilleDeRoute}
              {' '}
              feuille de route
            </span>
          </div>
        </div>
        <div className="fr-col background-blue-france fr-p-4w">
          <div className="fr-h1 fr-m-0">
            <TitleIcon
              background="white"
              icon="download-line"
            />
            {conventionnement.credit.total}
          </div>
          <div className="font-weight-500">
            Crédits engagés par l&apos;état
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            Soit
            {' '}
            <span className="font-weight-700">
              {conventionnement.credit.pourcentage}
              {' '}
              % de votre budget global
            </span>
          </div>
        </div>
      </div>
      <div className="font-weight-500">
        4 financements engagés par l&apos;état
      </div>
      <ul>
        {
          conventionnement.details.map((detail) => (
            <li
              className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
              key={detail.label}
            >
              <div>
                <Dot color={detail.color} />
                {' '}
                {detail.label}
              </div>
              <div className="font-weight-700">
                {detail.total}
              </div>
            </li>
          ))
        }
      </ul>
    </section>
  )
}

type Props = Readonly<{
  conventionnement: TableauDeBordViewModel['conventionnement']
  lienFinancements: string
}>
