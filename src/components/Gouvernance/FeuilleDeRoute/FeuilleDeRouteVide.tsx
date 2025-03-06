import Link from 'next/link'
import { ReactElement } from 'react'

export default function FeuilleDeRouteVide({ lien }: Props): ReactElement {
  return (
    <>
      <p className="fr-h6">
        Aucune feuille de route
      </p>
      <p>
        Cliquez sur le bouton gérer les feuilles de route pour définir votre première feuille de route.
      </p>
      <Link
        className="fr-btn fr-btn--icon-left fr-icon-add-line"
        href={lien}
      >
        Gérer les feuilles de route
      </Link>
    </>
  )
}

type Props = Readonly<{
  lien: string
}>
