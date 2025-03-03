import { ReactElement } from 'react'

import PageTitle from '../shared/PageTitle/PageTitle'

export default function MentionsLegales(): ReactElement {
  return (
    <>
      <PageTitle>
        Mentions légales
      </PageTitle>
      <h2>
        Éditeur de la plateforme
      </h2>
      <address className="fr-mb-2w">
        Agence Nationale de la Cohésion des Territoires
        <br />
        20 avenue de Ségur - TS 10717
        <br />
        75334 Paris Cedex 07
      </address>
      <h2>
        Directeur de la publication
      </h2>
      <p>
        Yves Le BRETON, Directeur général de l’Agence Nationale de la Cohésion des Territoires
      </p>
      <h2>
        Hébergement de la plateforme
      </h2>
      <p>
        Cette plateforme est hébergée par :
      </p>
      <address className="fr-mb-2w">
        Clever Cloud SAS
        <br />
        3 rue de l’Allier
        <br />
        44000 Nantes
        <br />
        France
      </address>
    </>
  )
}
