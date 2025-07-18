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
import { PrismaFeuillesDeRouteDeposeesLoader } from '@/gateways/tableauDeBord/PrismaFeuillesDeRouteDeposeesLoader'
import { PrismaFinancementsLoader } from '@/gateways/tableauDeBord/PrismaFinancementsLoader'
import { PrismaGouvernancesTerritorialesLoader } from '@/gateways/tableauDeBord/PrismaGouvernancesTerritorialesLoader'
import { PrismaIndicesDeFragiliteLoader } from '@/gateways/tableauDeBord/PrismaIndicesDeFragiliteLoader'
import { PrismaLieuxInclusionNumeriqueLoader } from '@/gateways/tableauDeBord/PrismaLieuxInclusionNumeriqueLoader'
import { PrismaMediateursEtAidantsLoader } from '@/gateways/tableauDeBord/PrismaMediateursEtAidantsLoader'
import { accompagnementsRealisesPresenter } from '@/presenters/tableauDeBord/accompagnementsRealisesPresenter'
import { feuillesDeRouteDeposeesPresenter } from '@/presenters/tableauDeBord/feuillesDeRouteDeposeesPresenter'
import { financementsPresenter } from '@/presenters/tableauDeBord/financementPresenter'
import { gouvernancePresenter } from '@/presenters/tableauDeBord/gouvernancePresenter'
import { gouvernancesTerritorialesPresenter } from '@/presenters/tableauDeBord/gouvernancesTerritorialesPresenter'
import { indiceFragilitePresenter } from '@/presenters/tableauDeBord/indiceFragilitePresenter'
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

  // Affichage conditionnel selon le rôle
  if (utilisateur.role.type === 'administrateur_dispositif') {
    const gouvernancesTerritorialesLoader = new PrismaGouvernancesTerritorialesLoader()
    const gouvernancesTerritorialesReadModel = await gouvernancesTerritorialesLoader.get()
    const gouvernancesTerritorialesViewModel = handleReadModelOrError(
      gouvernancesTerritorialesReadModel,
      gouvernancesTerritorialesPresenter
    )

    const feuillesDeRouteDeposeesLoader = new PrismaFeuillesDeRouteDeposeesLoader()
    const feuillesDeRouteDeposeesReadModel = await feuillesDeRouteDeposeesLoader.get()
    const feuillesDeRouteDeposeesViewModel = handleReadModelOrError(
      feuillesDeRouteDeposeesReadModel,
      feuillesDeRouteDeposeesPresenter
    )

    return (
      <TableauDeBordAdmin
        feuillesDeRouteDeposeesViewModel={feuillesDeRouteDeposeesViewModel}
        gouvernancesTerritorialesViewModel={gouvernancesTerritorialesViewModel}
      />
    )
  }

  // Tableau de bord du gestionnaire de département
  const departementCode = utilisateur.departementCode ?? ''
  
  const lieuxInclusionLoader = new PrismaLieuxInclusionNumeriqueLoader()
  const lieuxInclusionReadModel = await lieuxInclusionLoader.get(departementCode)
  const lieuxInclusionViewModel = handleReadModelOrError(
    lieuxInclusionReadModel,
    lieuxInclusionNumeriquePresenter
  )

  const mediateursEtAidantsLoader = new PrismaMediateursEtAidantsLoader()
  const mediateursEtAidantsReadModel = await mediateursEtAidantsLoader.get(departementCode)
  const mediateursEtAidantsViewModel = handleReadModelOrError(
    mediateursEtAidantsReadModel,
    mediateursEtAidantsPresenter
  )

  const accompagnementsRealisesLoader = new PrismaAccompagnementsRealisesLoader()
  const accompagnementsRealisesReadModel = await accompagnementsRealisesLoader.get(departementCode)
  const accompagnementsRealisesViewModel = handleReadModelOrError(
    accompagnementsRealisesReadModel,
    accompagnementsRealisesPresenter
  )

  const indicesLoader = new PrismaIndicesDeFragiliteLoader()
  const indicesReadModel = await indicesLoader.get(departementCode)
  const indicesFragilite = handleReadModelOrError(
    indicesReadModel,
    (readModel) => indiceFragilitePresenter(readModel.communes)
  )

  const financementsLoader = new PrismaFinancementsLoader()
  const financementsReadModel = await financementsLoader.get(departementCode)
  const financementsViewModel = handleReadModelOrError(
    financementsReadModel,
    financementsPresenter
  )

  const gouvernanceLoader = new PrismaGouvernanceTableauDeBordLoader()
  const gouvernanceReadModel = await gouvernanceLoader.get(departementCode)
  const gouvernanceViewModel = handleReadModelOrError(
    gouvernanceReadModel,
    gouvernancePresenter
  )

  const tableauDeBordViewModel = tableauDeBordPresenter(departementCode)

  return (
    <TableauDeBord 
      accompagnementsRealisesViewModel={accompagnementsRealisesViewModel}
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
