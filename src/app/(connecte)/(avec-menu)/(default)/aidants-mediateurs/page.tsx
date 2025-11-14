import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import AidantsMediateurs from '@/components/AidantsMediateurs/AidantsMediateurs'
import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { Administrateur } from '@/domain/Administrateur'
import { PrismaAccompagnementsEtMediateursLoader } from '@/gateways/aidantsMedIateurs/PrismaAccompagnementsEtMediateursLoader'
import { PrismaNiveauDeFormationLoader } from '@/gateways/aidantsMedIateurs/PrismaNiveauDeFormationLoader'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { accompagnementsEtMediateursPresenter, AccompagnementsEtMediateursViewModel } from '@/presenters/tableauDeBord/accompagnementsEtMediateursPresenter'
import { niveauDeFormationPresenter, NiveauDeFormationViewModel } from '@/presenters/tableauDeBord/niveauDeFormationPresenter'
import { fetchBeneficiairesEtAccompagnements } from '@/use-cases/queries/fetchBeneficiaires'
import { RecupererAccompagnementsEtMediateurs } from '@/use-cases/queries/RecupererAccompagnementsEtMediateurs'

export const metadata: Metadata = {
  title: 'Aidants et médiateurs numériques',
}

export default async function AidantsMediateursNumeriquesController(): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  const utilisateur = await utilisateurLoader.get(await getSessionSub())

  // Vérifier que l'utilisateur est bien administrateur_dispositif
  if (!(utilisateur instanceof Administrateur)) {
    redirect('/tableau-de-bord')
  }

  const accompagnementsEtMediateursUseCase = new RecupererAccompagnementsEtMediateurs(
    new PrismaAccompagnementsEtMediateursLoader()
  )
  const accompagnementsEtMediateursReadModel = await accompagnementsEtMediateursUseCase.execute({ territoire: 'France' })
  const accompagnementsEtMediateursViewModel = handleReadModelOrError(
    accompagnementsEtMediateursReadModel,
    accompagnementsEtMediateursPresenter
  ) as AccompagnementsEtMediateursViewModel | ErrorViewModel

  const niveauDeFormationLoader = new PrismaNiveauDeFormationLoader()
  const niveauDeFormationReadModel = await niveauDeFormationLoader.get()
  const niveauDeFormationViewModel = handleReadModelOrError(
    niveauDeFormationReadModel,
    niveauDeFormationPresenter
  ) as ErrorViewModel | NiveauDeFormationViewModel
  const dateGeneration = new Date()

  const beneficiairesEtAccompagnementsPromise = fetchBeneficiairesEtAccompagnements()

  return (
    <AidantsMediateurs
      accompagnementsEtMediateursViewModel={accompagnementsEtMediateursViewModel}
      beneficiairesEtAccompagnementsPromise={beneficiairesEtAccompagnementsPromise}
      dateGeneration={dateGeneration}
      niveauDeFormationViewModel={niveauDeFormationViewModel}
    />
  )
}