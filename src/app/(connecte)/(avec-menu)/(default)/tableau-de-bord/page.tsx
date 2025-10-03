import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import { handleReadModelOrError, isErrorReadModel } from '@/components/shared/ErrorHandler'
import TableauDeBord from '@/components/TableauDeBord/TableauDeBord'
import TableauDeBordAdmin from '@/components/TableauDeBord/TableauDeBordAdmin'
import { Administrateur } from '@/domain/Administrateur'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceTableauDeBordLoader } from '@/gateways/PrismaGouvernanceTableauDeBordLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { PrismaAccompagnementsRealisesLoader } from '@/gateways/tableauDeBord/PrismaAccompagnementsRealisesLoader'
import { PrismaBeneficiairesLoader } from '@/gateways/tableauDeBord/PrismaBeneficiairesLoader'
import { PrismaFinancementsAdminLoader } from '@/gateways/tableauDeBord/PrismaFinancementsAdminLoader'
import { PrismaFinancementsLoader } from '@/gateways/tableauDeBord/PrismaFinancementsLoader'
import { PrismaGouvernanceAdminLoader } from '@/gateways/tableauDeBord/PrismaGouvernanceAdminLoader'
import { PrismaIndicesDeFragiliteLoader } from '@/gateways/tableauDeBord/PrismaIndicesDeFragiliteLoader'
import { PrismaLieuxInclusionNumeriqueLoader } from '@/gateways/tableauDeBord/PrismaLieuxInclusionNumeriqueLoader'
import { PrismaMediateursEtAidantsLoader } from '@/gateways/tableauDeBord/PrismaMediateursEtAidantsLoader'
import { accompagnementsRealisesPresenter } from '@/presenters/tableauDeBord/accompagnementsRealisesPresenter'
import { beneficiairesPresenter } from '@/presenters/tableauDeBord/beneficiairesPresenter'
import { financementAdminPresenter } from '@/presenters/tableauDeBord/financementAdminPresenter'
import { financementsPrefPresenter } from '@/presenters/tableauDeBord/financementPrefPresenter'
import { gouvernanceAdminPresenter } from '@/presenters/tableauDeBord/gouvernanceAdminPresenter'
import { gouvernancePrefPresenter } from '@/presenters/tableauDeBord/gouvernancePrefPresenter'
import { indiceConfianceDepartementsAvecStatsPresenter, indiceFragiliteDepartementsPresenter, indiceFragilitePresenter } from '@/presenters/tableauDeBord/indicesPresenter'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'
import { mediateursEtAidantsPresenter } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'
import { tableauDeBordPresenter } from '@/presenters/tableauDeBord/tableauDeBordPresenter'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default async function TableauDeBordController(): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  const utilisateur = await utilisateurLoader.get(await getSessionSub())

  // Chargement des données communes
  const lieuxInclusionLoader = new PrismaLieuxInclusionNumeriqueLoader()
  const mediateursEtAidantsLoader = new PrismaMediateursEtAidantsLoader()
  const accompagnementsRealisesLoader = new PrismaAccompagnementsRealisesLoader()
  const indicesLoader = new PrismaIndicesDeFragiliteLoader()
  const financementsLoader = new PrismaFinancementsLoader()
  const gouvernanceLoader = new PrismaGouvernanceTableauDeBordLoader()
  const beneficiairesLoader = new PrismaBeneficiairesLoader()

  // Si administrateur, charger les données pour la France entière
  if (utilisateur instanceof Administrateur) {
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
    
    let indicesFragilite
    let indicesConfianceAvecStats
    
    if (isErrorReadModel(indicesReadModel)) {
      // Cas d'erreur
      indicesFragilite = {
        message: indicesReadModel.message,
        type: 'error' as const,
      }
      indicesConfianceAvecStats = {
        message: indicesReadModel.message,
        type: 'error' as const,
      }
    } else {
      // Le nouveau format avec statistiques
      indicesFragilite = indiceFragiliteDepartementsPresenter(indicesReadModel.departements)
      indicesConfianceAvecStats = indiceConfianceDepartementsAvecStatsPresenter(indicesReadModel)
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
        indicesConfianceAvecStats={indicesConfianceAvecStats}
        indicesFragilite={indicesFragilite}
        lieuxInclusionViewModel={lieuxInclusionViewModel}
        mediateursEtAidantsViewModel={mediateursEtAidantsViewModel}
        tableauDeBordViewModel={tableauDeBordViewModel}
      />
    )
  }
  const territoireUseCase = new RecupererTerritoireUtilisateur(new PrismaMembreLoader())
  const territoire = await territoireUseCase.handle(utilisateur)

  if (territoire.type === 'departement' && territoire.codes.length > 0) {
    const departementCode = territoire.codes[0]
    // Charger les données du tableau de bord pour ce département
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
      gouvernancePrefPresenter
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
  
  return (
    <div>
      Rôle incorrect
    </div>
  )
}
