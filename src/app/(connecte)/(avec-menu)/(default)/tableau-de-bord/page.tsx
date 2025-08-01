import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import TableauDeBord from '@/components/TableauDeBord/TableauDeBord'
import TableauDeBordAdmin from '@/components/TableauDeBord/TableauDeBordAdmin'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceTableauDeBordLoader } from '@/gateways/PrismaGouvernanceTableauDeBordLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaAccompagnementsRealisesLoader } from '@/gateways/tableauDeBord/PrismaAccompagnementsRealisesLoader'
import { PrismaBeneficiairesLoader } from '@/gateways/tableauDeBord/PrismaBeneficiairesLoader'
import { PrismaFinancementsAdminLoader } from '@/gateways/tableauDeBord/PrismaFinancementsAdminLoader'
import { PrismaFinancementsLoader } from '@/gateways/tableauDeBord/PrismaFinancementsLoader'
import { PrismaIndicesDeFragiliteLoader } from '@/gateways/tableauDeBord/PrismaIndicesDeFragiliteLoader'
import { PrismaLieuxInclusionNumeriqueLoader } from '@/gateways/tableauDeBord/PrismaLieuxInclusionNumeriqueLoader'
import { PrismaMediateursEtAidantsLoader } from '@/gateways/tableauDeBord/PrismaMediateursEtAidantsLoader'
import { accompagnementsRealisesPresenter } from '@/presenters/tableauDeBord/accompagnementsRealisesPresenter'
import { beneficiairesPresenter } from '@/presenters/tableauDeBord/beneficiairesPresenter'
import { financementAdminPresenter } from '@/presenters/tableauDeBord/financementAdminPresenter'
import { financementsPrefPresenter } from '@/presenters/tableauDeBord/financementPrefPresenter'
import { gouvernancePresenter } from '@/presenters/tableauDeBord/gouvernancePresenter'
import { indiceFragiliteDepartementsPresenter, indiceFragilitePresenter } from '@/presenters/tableauDeBord/indiceFragilitePresenter'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'
import { mediateursEtAidantsPresenter } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'
import { tableauDeBordPresenter } from '@/presenters/tableauDeBord/tableauDeBordPresenter'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default async function TableauDeBordController(): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(session.user.sub)

  // Chargement des données communes
  const lieuxInclusionLoader = new PrismaLieuxInclusionNumeriqueLoader()
  const mediateursEtAidantsLoader = new PrismaMediateursEtAidantsLoader()
  const accompagnementsRealisesLoader = new PrismaAccompagnementsRealisesLoader()
  const indicesLoader = new PrismaIndicesDeFragiliteLoader()
  const financementsLoader = new PrismaFinancementsLoader()
  const gouvernanceLoader = new PrismaGouvernanceTableauDeBordLoader()
  const beneficiairesLoader = new PrismaBeneficiairesLoader()

  // Si administrateur, charger les données pour la France entière
  if (utilisateur.role.type === 'administrateur_dispositif') {
    const lieuxInclusionReadModel = await lieuxInclusionLoader.get('France')
    const lieuxInclusionViewModel = handleReadModelOrError(
      lieuxInclusionReadModel,
      lieuxInclusionNumeriquePresenter
    )

    const mediateursEtAidantsReadModel = await mediateursEtAidantsLoader.get('France')
    const mediateursEtAidantsViewModel = handleReadModelOrError(
      mediateursEtAidantsReadModel,
      mediateursEtAidantsPresenter
    )

    const accompagnementsRealisesReadModel = await accompagnementsRealisesLoader.get('France')
    const accompagnementsRealisesViewModel = handleReadModelOrError(
      accompagnementsRealisesReadModel,
      accompagnementsRealisesPresenter
    )

    const indicesReadModel = await indicesLoader.getForFrance()
    const indicesFragilite = handleReadModelOrError(
      indicesReadModel,
      indiceFragiliteDepartementsPresenter
    )

    const financementsAdminLoader = new PrismaFinancementsAdminLoader()
    const financementsReadModel = await financementsAdminLoader.get()
    const financementsViewModel = handleReadModelOrError(
      financementsReadModel,
      financementAdminPresenter
    )

    const gouvernanceReadModel = await gouvernanceLoader.get('France')
    const gouvernanceViewModel = handleReadModelOrError(
      gouvernanceReadModel,
      gouvernancePresenter
    )

    const beneficiairesReadModel = await beneficiairesLoader.get('France')
    const beneficiairesViewModel = handleReadModelOrError(
      beneficiairesReadModel,
      beneficiairesPresenter
    )

    const tableauDeBordViewModel = tableauDeBordPresenter('France')

    return (
      <TableauDeBordAdmin
        accompagnementsRealisesViewModel={accompagnementsRealisesViewModel}
        beneficiairesViewModel={beneficiairesViewModel}
        financementsViewModel={financementsViewModel}
        gouvernanceViewModel={gouvernanceViewModel}
        indicesFragilite={indicesFragilite}
        lieuxInclusionViewModel={lieuxInclusionViewModel}
        mediateursEtAidantsViewModel={mediateursEtAidantsViewModel}
        tableauDeBordViewModel={tableauDeBordViewModel}
      />
    )
  }

  // Tableau de bord du gestionnaire de département
  const departementCode = utilisateur.departementCode ?? ''
  
  const lieuxInclusionReadModel = await lieuxInclusionLoader.get(departementCode)
  const lieuxInclusionViewModel = handleReadModelOrError(
    lieuxInclusionReadModel,
    lieuxInclusionNumeriquePresenter
  )

  const mediateursEtAidantsReadModel = await mediateursEtAidantsLoader.get(departementCode)
  const mediateursEtAidantsViewModel = handleReadModelOrError(
    mediateursEtAidantsReadModel,
    mediateursEtAidantsPresenter
  )

  const accompagnementsRealisesReadModel = await accompagnementsRealisesLoader.get(departementCode)
  const accompagnementsRealisesViewModel = handleReadModelOrError(
    accompagnementsRealisesReadModel,
    accompagnementsRealisesPresenter
  )

  const indicesReadModel = await indicesLoader.getForDepartement(departementCode)
  const indicesFragilite = handleReadModelOrError(
    indicesReadModel,
    indiceFragilitePresenter
  )

  const financementsReadModel = await financementsLoader.get(departementCode)
  const financementsViewModel = handleReadModelOrError(
    financementsReadModel,
    financementsPrefPresenter
  )

  const gouvernanceReadModel = await gouvernanceLoader.get(departementCode)
  const gouvernanceViewModel = handleReadModelOrError(
    gouvernanceReadModel,
    gouvernancePresenter
  )

  const beneficiairesReadModel = await beneficiairesLoader.get(departementCode)
  const beneficiairesViewModel = handleReadModelOrError(
    beneficiairesReadModel,
    beneficiairesPresenter
  )

  const tableauDeBordViewModel = tableauDeBordPresenter(departementCode)

  return (
    <TableauDeBord 
      accompagnementsRealisesViewModel={accompagnementsRealisesViewModel}
      beneficiairesViewModel={beneficiairesViewModel}
      departement={departementCode}
      financementsViewModel={financementsViewModel}
      gouvernanceViewModel={gouvernanceViewModel}
      indicesFragilite={indicesFragilite}
      lieuxInclusionViewModel={lieuxInclusionViewModel}
      mediateursEtAidantsViewModel={mediateursEtAidantsViewModel}
      tableauDeBordViewModel={tableauDeBordViewModel}
    />
  )
}
