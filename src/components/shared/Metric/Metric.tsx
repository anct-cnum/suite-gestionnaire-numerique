import { ReactElement } from 'react'

export default function Metric({
  chiffre,
  prefix = '',
  sousTitre,
  suffix = '',
  titre,
}: Props): ReactElement {
  return (
    <div className="fr-mb-3w">
      <div className="fr-display--xs fr-mb-1w">
        {prefix}
        {chiffre}
        {suffix}
      </div>
      <div className="fr-text--lg font-weight-700 fr-mb-1w">
        {titre}
      </div>
      <div className="color-blue-france fr-pb-4w">
        {sousTitre}
      </div>
    </div>
  )
}

type Props = Readonly<{
  chiffre: string
  prefix?: string
  sousTitre: string
  suffix?: string
  titre: string
}>