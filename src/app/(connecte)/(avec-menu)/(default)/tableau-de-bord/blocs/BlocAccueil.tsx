import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'
import { Contexte } from '@/use-cases/queries/ResoudreContexte'

export default function BlocAccueil({ contexte, prenom }: Props): ReactElement {
  const sousTitre = contexte.estGestionnaireStructureSansGouvernance()
    ? "Bienvenue sur votre espace structure de l'inclusion numérique"
    : `Bienvenue sur l'outil de pilotage de l'Inclusion Numérique · ${contexte.codeTerritoire()}`

  return (
    <>
      <PageTitle>
        <span>👋 Bonjour {prenom}</span>
        <br />
        <span className="fr-text--lead color-blue-france">{sousTitre}</span>
      </PageTitle>
      <hr className="fr-hr" />
    </>
  )
}

type Props = Readonly<{
  contexte: Contexte
  prenom: string
}>
