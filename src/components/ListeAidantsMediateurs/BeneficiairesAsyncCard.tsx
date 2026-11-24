'use client'

import { ReactElement, use } from 'react'

import { parseTextWithBold } from '../../shared/textFormatting'
import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'
import InformationDepliable, {
  BoutonInformation,
  TexteInformation,
} from '@/components/shared/Information/InformationDepliable'
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

  // #2350 : hauteur minimale et non fixe, pour que le texte déplié par le « i » agrandisse la carte sans déborder
  return (
    <div
      className="fr-col-12 fr-col-md-4"
      style={{
        minHeight: '7rem',
      }}
    >
      <div
        className="fr-background-alt--blue-france fr-p-2w"
        style={{
          borderRadius: '1rem',
          gap: '1rem',
          minHeight: '7rem',
        }}
      >
        <div className="fr-h5 fr-text-title--blue-france fr-m-0">{formaterEnNombreFrancais(beneficiaires)}</div>
        <InformationDepliable>
          <div className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-m-0">
            Bénéficiaires accompagnés
            <BoutonInformation libelle="Plus d'information sur les bénéficiaires accompagnés" />
          </div>
          <TexteInformation>
            <p className="fr-text--sm fr-mb-1v">
              Après un accompagnement le médiateur peut choisir d&apos;enregistrer la personne accompagnée dans sa liste
              de bénéficiaires.
            </p>
            <p className="fr-text--sm fr-mb-1v">
              <strong>Exemple sur un mois :</strong>
            </p>
            <ul className="fr-list fr-text--sm fr-mt-1v fr-mb-1v fr-pl-2w">
              <li>1 personne suivie accompagnée 3 fois = 1 accompagnement</li>
              <li>1 personne anonyme accompagnée 2 fois = 2 accompagnements</li>
            </ul>
            <p className="fr-text--sm fr-mb-1v">Total affiché : 3 accompagnements (1 suivi + 2 anonymes)</p>
          </TexteInformation>
        </InformationDepliable>
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
