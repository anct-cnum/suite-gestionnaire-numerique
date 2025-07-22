'use client'

import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js'
import { ReactElement, useContext } from 'react'

import EtatDesLieux from './EtatDesLieux/EtatDesLieux'
import Financements from './Financements'
import Gouvernance from './Gouvernance/Gouvernance'
import { clientContext } from '../shared/ClientContext'
import PageTitle from '../shared/PageTitle/PageTitle'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AccompagnementsRealisesViewModel } from '@/presenters/tableauDeBord/accompagnementsRealisesPresenter'
import { FinancementViewModel } from '@/presenters/tableauDeBord/financementPresenter'
import { GouvernanceViewModel } from '@/presenters/tableauDeBord/gouvernancePresenter'
import { CommuneFragilite } from '@/presenters/tableauDeBord/indiceFragilitePresenter'
import { LieuxInclusionNumeriqueViewModel } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'
import { MediateursEtAidantsViewModel } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'
import { TableauDeBordViewModel } from '@/presenters/tableauDeBord/tableauDeBordPresenter'

export default function TableauDeBordAdmin({
  accompagnementsRealisesViewModel,
  financementsViewModel,
  gouvernanceViewModel,
  indicesFragilite,
  lieuxInclusionViewModel,
  mediateursEtAidantsViewModel,
  tableauDeBordViewModel,
}: Props): ReactElement {
  const { sessionUtilisateurViewModel } = useContext(clientContext)

  ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip
  )

  return (
    <>
      <PageTitle>
        <span>
          👋 Bonjour
          {' '}
          {sessionUtilisateurViewModel.prenom}
        </span>
        <br />
        <span className="fr-text--lead color-blue-france">
          Bienvenue sur l&apos;outil de pilotage de l&apos;Inclusion Numérique · France
        </span>
      </PageTitle>
      <hr className="fr-hr" />
      <EtatDesLieux
        accompagnementsRealisesViewModel={accompagnementsRealisesViewModel}
        departement="France"
        indicesFragilite={indicesFragilite}
        lieuxInclusionViewModel={lieuxInclusionViewModel}
        mediateursEtAidantsViewModel={mediateursEtAidantsViewModel}
      /> 
      <Gouvernance
        gouvernanceViewModel={gouvernanceViewModel}
        lienGouvernance={tableauDeBordViewModel.liens.gouvernance}
      />
      <Financements
        conventionnement={financementsViewModel}
        lienFinancements={tableauDeBordViewModel.liens.financements}
      />
    </>
  )
}

type Props = Readonly<{
  accompagnementsRealisesViewModel: AccompagnementsRealisesViewModel | ErrorViewModel
  financementsViewModel: ErrorViewModel | FinancementViewModel
  gouvernanceViewModel: ErrorViewModel | GouvernanceViewModel
  indicesFragilite: Array<CommuneFragilite> | ErrorViewModel
  lieuxInclusionViewModel: ErrorViewModel | LieuxInclusionNumeriqueViewModel
  mediateursEtAidantsViewModel: ErrorViewModel | MediateursEtAidantsViewModel
  tableauDeBordViewModel: TableauDeBordViewModel
}>