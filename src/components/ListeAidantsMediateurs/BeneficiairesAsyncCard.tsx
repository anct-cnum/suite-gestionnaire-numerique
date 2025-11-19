'use client'

import { ReactElement, use } from 'react'

import { parseTextWithBold } from '../../shared/textFormatting'
import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'
import Information from '@/components/shared/Information/Information'
import { formaterEnNombreFrancais } from '@/presenters/shared/number'

export default function BeneficiairesAsyncCard({
  hasActiveFilters,
  totalBeneficiairesPromise,
}: Props): ReactElement {
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
          <div className="fr-h5 fr-text-title--blue-france fr-m-0 color-orange">
            -
          </div>
          <div className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-m-0">
            Bénéficiaires accompagnés
          </div>
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
        <div className="fr-h5 fr-text-title--blue-france fr-m-0">
          {formaterEnNombreFrancais(beneficiaires)}
        </div>
        <div className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-m-0">
          Bénéficiaires accompagnés
          <Information  label="Sur la Coop, après un accompagnement, le médiateur peut choisir d’enregistrer ou non la personne accompagnée dans sa liste de bénéficiaires et de la rattacher à cet accompagnement.

Exemple sur un mois :

Une personne suivie est accompagnée trois fois. Elle compte pour un seul bénéficiaire.
Une personne anonyme est accompagnée deux fois. Elle compte pour deux bénéficiaires.
Le total affiché pour ce mois sera donc 3 bénéficiaires : 1 suivi + 2 anonymes "
          />
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
