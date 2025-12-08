import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { handleReadModelOrError, isErrorReadModel } from '@/components/shared/ErrorHandler'
import TableauDeBord from '@/components/TableauDeBord/TableauDeBord'
import TableauDeBordAdmin from '@/components/TableauDeBord/TableauDeBordAdmin'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceTableauDeBordLoader } from '@/gateways/PrismaGouvernanceTableauDeBordLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaBeneficiairesLoader } from '@/gateways/tableauDeBord/PrismaBeneficiairesLoader'
import { PrismaFinancementsAdminLoader } from '@/gateways/tableauDeBord/PrismaFinancementsAdminLoader'
import { PrismaFinancementsLoader } from '@/gateways/tableauDeBord/PrismaFinancementsLoader'
import { PrismaGouvernanceAdminLoader } from '@/gateways/tableauDeBord/PrismaGouvernanceAdminLoader'
import { PrismaIndicesDeFragiliteLoader } from '@/gateways/tableauDeBord/PrismaIndicesDeFragiliteLoader'
import { PrismaLieuxInclusionNumeriqueLoader } from '@/gateways/tableauDeBord/PrismaLieuxInclusionNumeriqueLoader'
import { PrismaMediateursEtAidantsLoader } from '@/gateways/tableauDeBord/PrismaMediateursEtAidantsLoader'
import { beneficiairesPresenter } from '@/presenters/tableauDeBord/beneficiairesPresenter'
import { financementAdminPresenter } from '@/presenters/tableauDeBord/financementAdminPresenter'
import { financementsPrefPresenter } from '@/presenters/tableauDeBord/financementPrefPresenter'
import { gouvernanceAdminPresenter } from '@/presenters/tableauDeBord/gouvernanceAdminPresenter'
import { gouvernancePrefPresenter } from '@/presenters/tableauDeBord/gouvernancePrefPresenter'
import { indiceFragiliteDepartementsPresenter, indiceFragilitePresenter } from '@/presenters/tableauDeBord/indicesPresenter'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'
import { mediateursEtAidantsPresenter } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'
import { tableauDeBordPresenter } from '@/presenters/tableauDeBord/tableauDeBordPresenter'
import { fetchAccompagnementsRealises } from '@/use-cases/queries/fetchAccompagnementsRealises'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default async function TableauDeBordController(): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(await getSessionSub())

  // Récupérer le territoire de l'utilisateur
  const territoireUseCase = new RecupererTerritoireUtilisateur(new PrismaMembreLoader())
  const territoire = await territoireUseCase.handle(utilisateur)

  // Extraire le code territoire
  const territoireCode = territoire.type === 'france' ? 'France' : territoire.codes[0]

  // Vérifier que le territoire est valide
  if (!territoireCode || territoire.type === 'departement' && territoire.codes.length === 0) {
    return (
      <div>
        Rôle incorrect
      </div>
    )
  }

  // Instancier les loaders communs
  const lieuxInclusionLoader = new PrismaLieuxInclusionNumeriqueLoader()
  const mediateursEtAidantsLoader = new PrismaMediateursEtAidantsLoader()
  const beneficiairesLoader = new PrismaBeneficiairesLoader()

  // Créer la Promise pour les accompagnements (sera résolue de manière asynchrone via Suspense)
  const accompagnementsRealisesPromise = fetchAccompagnementsRealises(territoireCode)

  // Charger les données communes
  const lieuxInclusionReadModel = await lieuxInclusionLoader.get(territoireCode)
  const lieuxInclusionViewModel = handleReadModelOrError(
    lieuxInclusionReadModel,
    lieuxInclusionNumeriquePresenter
  )

  const mediateursEtAidantsReadModel = await mediateursEtAidantsLoader.get(territoireCode)
  const mediateursEtAidantsViewModel = handleReadModelOrError(
    mediateursEtAidantsReadModel,
    mediateursEtAidantsPresenter
  )

  const beneficiairesReadModel = await beneficiairesLoader.get(territoireCode)
  const beneficiairesViewModel = handleReadModelOrError(
    beneficiairesReadModel,
    beneficiairesPresenter
  )

  const tableauDeBordViewModel = tableauDeBordPresenter(territoireCode)

  // Si administrateur, charger les données spécifiques à l'admin
  if (territoire.type === 'france') {
    const indicesLoader = new PrismaIndicesDeFragiliteLoader()
    const indicesReadModel = await indicesLoader.getForFrance()

    let indicesFragilite
    if (isErrorReadModel(indicesReadModel)) {
      indicesFragilite = {
        message: indicesReadModel.message,
        type: 'error' as const,
      }
    } else {
      indicesFragilite = indiceFragiliteDepartementsPresenter(indicesReadModel.departements)
    }

    const financementsAdminLoader = new PrismaFinancementsAdminLoader()
    const financementsReadModel = await financementsAdminLoader.get()
    const financementsViewModel = handleReadModelOrError(
      financementsReadModel,
      financementAdminPresenter
    )

    const gouvernanceAdminLoader = new PrismaGouvernanceAdminLoader()
    const gouvernanceReadModel = await gouvernanceAdminLoader.get()
    const gouvernanceViewModel = handleReadModelOrError(
      gouvernanceReadModel,
      gouvernanceAdminPresenter
    )

    return (
      <TableauDeBordAdmin
        accompagnementsRealisesPromise={accompagnementsRealisesPromise}
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

  // Sinon, charger les données spécifiques au département
  const indicesLoader = new PrismaIndicesDeFragiliteLoader()
  const indicesReadModel = await indicesLoader.getForDepartement(territoireCode)
  const indicesFragilite = handleReadModelOrError(
    indicesReadModel,
    indiceFragilitePresenter
  )

  const financementsLoader = new PrismaFinancementsLoader()
  const financementsReadModel = await financementsLoader.get(territoireCode)
  const financementsViewModel = handleReadModelOrError(
    financementsReadModel,
    financementsPrefPresenter
  )

  const gouvernanceLoader = new PrismaGouvernanceTableauDeBordLoader()
  const gouvernanceReadModel = await gouvernanceLoader.get(territoireCode)
  const gouvernanceViewModel = handleReadModelOrError(
    gouvernanceReadModel,
    gouvernancePrefPresenter
  )

  return (
    <TableauDeBord
      accompagnementsRealisesPromise={accompagnementsRealisesPromise}
      beneficiairesViewModel={beneficiairesViewModel}
      departement={territoireCode}
      financementsViewModel={financementsViewModel}
      gouvernanceViewModel={gouvernanceViewModel}
      indicesFragilite={indicesFragilite}
      lieuxInclusionViewModel={lieuxInclusionViewModel}
      mediateursEtAidantsViewModel={mediateursEtAidantsViewModel}
      tableauDeBordViewModel={tableauDeBordViewModel}
    />
  )
}
