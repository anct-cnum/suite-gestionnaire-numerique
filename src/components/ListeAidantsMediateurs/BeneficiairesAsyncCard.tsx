'use client'

import { ReactElement, use } from 'react'

import { parseTextWithBold } from '../../shared/textFormatting'
import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'
import Information from '@/components/shared/Information/Information'
import { formaterEnNombreFrancais } from '@/presenters/shared/number'

export default function BeneficiairesAsyncCard({ hasActiveFilters, totalBeneficiairesPromise }: Props): ReactElement {
  const beneficiaires = use(totalBeneficiairesPromise)

  if (isErrorViewModel(beneficiaires) || hasActiveFilters) {
    return (
      <div
        className="fr-col-12 fr-col-md-4"
        style={{
          height: '7rem',
        }}
      >
        <div
          className="fr-background-alt--blue-france fr-p-2w"
          style={{
            borderRadius: '1rem',
            gap: '1rem',
            height: '7rem',
          }}
        >
          <div className="fr-h5 fr-text-title--blue-france fr-m-0 color-orange">-</div>
          <div className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-m-0">Bénéficiaires accompagnés</div>
          <div className="fr-text--sm fr-text-title--blue-france fr-m-0">
            {parseTextWithBold('sur les 30 derniers jours')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fr-col-12 fr-col-md-4"
      style={{
        height: '7rem',
      }}
    >
      <div
        className="fr-background-alt--blue-france fr-p-2w"
        style={{
          borderRadius: '1rem',
          gap: '1rem',
          height: '7rem',
        }}
      >
        <div className="fr-h5 fr-text-title--blue-france fr-m-0">{formaterEnNombreFrancais(beneficiaires)}</div>
        <div className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-m-0">
          Bénéficiaires accompagnés
          <Information>
            <div className="fr-mb-0">
              <p className="fr-mb-1v">
                Après un accompagnement le médiateur peut choisir d&apos;enregistrer la personne accompagnée dans sa{' '}
                liste de bénéficiaires.
              </p>
              <p className="fr-mb-1v">
                <strong>Exemple sur un mois :</strong>
              </p>
              <ul className="fr-mt-1v fr-mb-1v fr-pl-2w">
                <li>1 personne suivie accompagnée 3 fois = 1 accompagnement</li>
                <li>1 personne anonyme accompagnée 2 fois = 2 accompagnements</li>
              </ul>
              <p className="fr-mb-0">Total affiché : 3 accompagnements (1 suivi + 2 anonymes)</p>
            </div>
          </Information>
        </div>
        <div className="fr-text--sm fr-text-title--blue-france fr-m-0">
          {parseTextWithBold('sur les 30 derniers jours')}
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  hasActiveFilters: boolean
  totalBeneficiairesPromise: Promise<ErrorViewModel | number>
}>
