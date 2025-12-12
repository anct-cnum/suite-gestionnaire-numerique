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
          <Information>
            <p className="fr-mb-0">
              Sur la Coop, après un accompagnement, le médiateur peut choisir d&apos;enregistrer ou
              non la personne accompagnée dans sa liste de bénéficiaires et de la rattacher à
              cet accompagnement.
              {' '}
              <br />
              <br />
              Exemple sur un mois :
              {' '}
              <br />
              Une personne suivie est accompagnée trois fois. Elle compte pour 1 accompagnement.
              <br />
              <br />
              Une personne anonyme est accompagnée deux fois. Elle compte pour 2
              accompagnements.
              {' '}
              <br />
              <br />
              Le total affiché pour ce mois sera donc 3 accompagnements : 1 suivi + 2 anonymes
            </p>
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
