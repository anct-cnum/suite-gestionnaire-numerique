import { ReactElement } from 'react'

export default function CarteStatistiqueAidantsConnect({
  nombre,
  sousTexte,
}: Props): ReactElement {
  return (
    <div
      className="background-blue-france fr-p-4w fr-mb-1w"
      style={{ flex: 1 }}
    >
      <div className="fr-h1 fr-m-0">
        {nombre}
      </div>
      <div className="font-weight-500">
        Habilités Aidants Connect
      </div>
      <div className="fr-text--xs color-blue-france fr-mb-0">
        {sousTexte}
      </div>
    </div>
  )
}

type Props = Readonly<{
  nombre: string
  sousTexte: string
}>
