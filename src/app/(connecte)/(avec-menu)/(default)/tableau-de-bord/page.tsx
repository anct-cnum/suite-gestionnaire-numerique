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
import { PrismaConseillerNumeriqueTableauDeBordLoader } from '@/gateways/tableauDeBord/PrismaConseillerNumeriqueTableauDeBordLoader'
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
import { TableauDeBordLoaderBeneficiaires } from '@/use-cases/queries/RecuperBeneficiaires'
import { ConseillerNumeriqueTableauDeBordReadModel } from '@/use-cases/queries/RecupererConseillerNumeriqueTableauDeBord'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'
import { TableauDeBordLoaderFinancements, TableauDeBordLoaderFinancementsAdmin } from '@/use-cases/queries/RecuperFinancements'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

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
  const cnLoader = new PrismaConseillerNumeriqueTableauDeBordLoader()

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

  // Charger les données des bénéficiaires et les données Conseiller numérique
  const beneficiairesReadModel = await beneficiairesLoader.get(territoireCode)
  const cnReadModel = await cnLoader.get(territoireCode)

  // Fusionner les données CN dans les bénéficiaires
  const mergedBeneficiaires = mergeCnIntoBeneficiaires(beneficiairesReadModel, cnReadModel)
  const beneficiairesViewModel = handleReadModelOrError(
    mergedBeneficiaires,
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
    const mergedFinancementsAdmin = mergeCnIntoFinancementsAdmin(financementsReadModel, cnReadModel)
    const financementsViewModel = handleReadModelOrError(
      mergedFinancementsAdmin,
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
  const mergedFinancementsPref = mergeCnIntoFinancementsPref(financementsReadModel, cnReadModel)
  const financementsViewModel = handleReadModelOrError(
    mergedFinancementsPref,
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

function cnEnveloppesVentilation(
  cnReadModel: ConseillerNumeriqueTableauDeBordReadModel
): ReadonlyArray<{ enveloppeTotale: string; label: string; total: string }> {
  return cnReadModel.enveloppes.map((enveloppe) => ({
    enveloppeTotale: enveloppe.enveloppeTotale.toString(),
    label: enveloppe.label,
    total: enveloppe.creditsEngages.toString(),
  }))
}

function cnTotalCredits(cnReadModel: ConseillerNumeriqueTableauDeBordReadModel): number {
  return cnReadModel.enveloppes.reduce((acc, enveloppe) => acc + enveloppe.creditsEngages, 0)
}

function cnTotalEnveloppes(cnReadModel: ConseillerNumeriqueTableauDeBordReadModel): number {
  return cnReadModel.enveloppes.reduce((acc, enveloppe) => acc + enveloppe.enveloppeTotale, 0)
}

function hasCnData(
  cnReadModel: ConseillerNumeriqueTableauDeBordReadModel | ErrorReadModel
): cnReadModel is ConseillerNumeriqueTableauDeBordReadModel {
  return !isErrorReadModel(cnReadModel) && cnReadModel.enveloppes.length > 0
}

function mergeCnIntoBeneficiaires(
  beneficiairesReadModel: ErrorReadModel | TableauDeBordLoaderBeneficiaires,
  cnReadModel: ConseillerNumeriqueTableauDeBordReadModel | ErrorReadModel
): ErrorReadModel | TableauDeBordLoaderBeneficiaires {
  if (isErrorReadModel(beneficiairesReadModel) || !hasCnData(cnReadModel)) {
    return beneficiairesReadModel
  }

  const cnDetails = cnReadModel.enveloppes.map((enveloppe) => ({
    label: enveloppe.label,
    total: enveloppe.beneficiaires,
  }))
  const cnTotal = cnReadModel.enveloppes
    .reduce((acc, enveloppe) => acc + enveloppe.beneficiaires, 0)

  return {
    collectivite: beneficiairesReadModel.collectivite,
    details: [...beneficiairesReadModel.details, ...cnDetails],
    total: beneficiairesReadModel.total + cnTotal,
  }
}

function mergeCnIntoFinancementsAdmin(
  financementsReadModel: ErrorReadModel | TableauDeBordLoaderFinancementsAdmin,
  cnReadModel: ConseillerNumeriqueTableauDeBordReadModel | ErrorReadModel
): ErrorReadModel | TableauDeBordLoaderFinancementsAdmin {
  if (isErrorReadModel(financementsReadModel) || !hasCnData(cnReadModel)) {
    return financementsReadModel
  }

  const totalCreditsCn = cnTotalCredits(cnReadModel)
  const newCreditsEngages = Number(financementsReadModel.creditsEngages) + totalCreditsCn

  return {
    ...financementsReadModel,
    creditsEngages: newCreditsEngages.toString(),
    nombreEnveloppesUtilisees: financementsReadModel.nombreEnveloppesUtilisees + cnReadModel.enveloppes.length,
    ventilationSubventionsParEnveloppe: [
      ...financementsReadModel.ventilationSubventionsParEnveloppe,
      ...cnEnveloppesVentilation(cnReadModel),
    ],
  }
}

function mergeCnIntoFinancementsPref(
  financementsReadModel: ErrorReadModel | TableauDeBordLoaderFinancements,
  cnReadModel: ConseillerNumeriqueTableauDeBordReadModel | ErrorReadModel
): ErrorReadModel | TableauDeBordLoaderFinancements {
  if (isErrorReadModel(financementsReadModel) || !hasCnData(cnReadModel)) {
    return financementsReadModel
  }

  const totalEnveloppesCn = cnTotalEnveloppes(cnReadModel)
  const totalCreditsCn = cnTotalCredits(cnReadModel)
  const newBudgetTotal = Number(financementsReadModel.budget.total) + totalEnveloppesCn
  const newCreditTotal = Number(financementsReadModel.credit.total) + totalCreditsCn
  const newPourcentage = newBudgetTotal > 0 ? Math.round(newCreditTotal / newBudgetTotal * 100) : 0

  return {
    ...financementsReadModel,
    budget: {
      ...financementsReadModel.budget,
      total: newBudgetTotal.toString(),
    },
    credit: {
      pourcentage: newPourcentage,
      total: newCreditTotal.toString(),
    },
    ventilationSubventionsParEnveloppe: [
      ...financementsReadModel.ventilationSubventionsParEnveloppe,
      ...cnEnveloppesVentilation(cnReadModel),
    ],
  }
}
