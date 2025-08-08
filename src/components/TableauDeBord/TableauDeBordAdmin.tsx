'use client'

import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js'
import { ReactElement, useContext } from 'react'

import Beneficiaires from './Beneficiaires'
import EtatDesLieux from './EtatDesLieux/EtatDesLieux'
import FinancementsAdmin from './FinancementsAdmin'
import GouvernanceAdmin from './Gouvernance/GouvernanceAdmin'
import { clientContext } from '../shared/ClientContext'
import PageTitle from '../shared/PageTitle/PageTitle'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AccompagnementsRealisesViewModel } from '@/presenters/tableauDeBord/accompagnementsRealisesPresenter'
import { BeneficiairesViewModel } from '@/presenters/tableauDeBord/beneficiairesPresenter'
import { FinancementAdminViewModel } from '@/presenters/tableauDeBord/financementAdminPresenter'
import { GouvernanceAdminViewModel } from '@/presenters/tableauDeBord/gouvernanceAdminPresenter'
import { DepartementConfiance, DepartementFragilite } from '@/presenters/tableauDeBord/indicesPresenter'
import { LieuxInclusionNumeriqueViewModel } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'
import { MediateursEtAidantsViewModel } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'
import { TableauDeBordViewModel } from '@/presenters/tableauDeBord/tableauDeBordPresenter'

export default function TableauDeBordAdmin({
  accompagnementsRealisesViewModel,
  beneficiairesViewModel,
  financementsViewModel,
  gouvernanceViewModel,
  indicesConfiance,
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
        lieuxInclusionViewModel={lieuxInclusionViewModel}
        mediateursEtAidantsViewModel={mediateursEtAidantsViewModel}
        territoire={{
          indicesConfiance: indicesConfiance as Array<DepartementConfiance>,
          indicesFragilite: indicesFragilite as Array<DepartementFragilite>,
          type: 'France',
        }}
      /> 
      <GouvernanceAdmin
        gouvernanceViewModel={gouvernanceViewModel}
        lienGouvernance={tableauDeBordViewModel.liens.gouvernance}
      />
      <FinancementsAdmin
        financementViewModel={financementsViewModel}
        lienFinancements={tableauDeBordViewModel.liens.financements}
      />
      <Beneficiaires
        beneficiairesViewModel={beneficiairesViewModel}
        lienBeneficiaires={tableauDeBordViewModel.liens.beneficiaires}
      />
    </>
  )
}

type Props = Readonly<{
  accompagnementsRealisesViewModel: AccompagnementsRealisesViewModel | ErrorViewModel
  beneficiairesViewModel: BeneficiairesViewModel | ErrorViewModel
  financementsViewModel: ErrorViewModel | FinancementAdminViewModel
  gouvernanceViewModel: ErrorViewModel | GouvernanceAdminViewModel
  indicesConfiance: Array<DepartementConfiance> | ErrorViewModel
  indicesFragilite:  Array<DepartementFragilite> | ErrorViewModel
  lieuxInclusionViewModel: ErrorViewModel | LieuxInclusionNumeriqueViewModel
  mediateursEtAidantsViewModel: ErrorViewModel | MediateursEtAidantsViewModel
  tableauDeBordViewModel: TableauDeBordViewModel
}>