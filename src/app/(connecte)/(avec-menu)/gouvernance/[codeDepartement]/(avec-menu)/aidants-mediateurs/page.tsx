import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import AidantsMediateurs from '@/components/AidantsMediateurs/AidantsMediateurs'
import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { PrismaAccompagnementsEtMediateursLoader } from '@/gateways/aidantsMedIateurs/PrismaAccompagnementsEtMediateursLoader'
import { PrismaNiveauDeFormationLoader } from '@/gateways/aidantsMedIateurs/PrismaNiveauDeFormationLoader'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import {
  accompagnementsEtMediateursPresenter,
  AccompagnementsEtMediateursViewModel,
} from '@/presenters/tableauDeBord/accompagnementsEtMediateursPresenter'
import {
  niveauDeFormationPresenter,
  NiveauDeFormationViewModel,
} from '@/presenters/tableauDeBord/niveauDeFormationPresenter'
import { nomDepartement } from '@/shared/urlHelpers'
import { fetchBeneficiairesEtAccompagnements } from '@/use-cases/queries/fetchBeneficiaires'
import { RecupererAccompagnementsEtMediateurs } from '@/use-cases/queries/RecupererAccompagnementsEtMediateurs'

export const metadata: Metadata = {
  title: 'Aidants et médiateurs numériques',
}

export default async function AidantsMediateursGouvernanceController({ params }: Props): Promise<ReactElement> {
  const session = await getSession()
  const { codeDepartement } = await params

  if (!session) {
    redirect('/connexion')
  }

  const accompagnementsEtMediateursPromise = new RecupererAccompagnementsEtMediateurs(
    new PrismaAccompagnementsEtMediateursLoader()
  )
    .execute({ territoire: codeDepartement })
    .then(
      (readModel) =>
        handleReadModelOrError(readModel, accompagnementsEtMediateursPresenter) as
          | AccompagnementsEtMediateursViewModel
          | ErrorViewModel
    )

  const niveauDeFormationPromise = new PrismaNiveauDeFormationLoader()
    .get(codeDepartement)
    .then(
      (readModel) =>
        handleReadModelOrError(readModel, niveauDeFormationPresenter) as ErrorViewModel | NiveauDeFormationViewModel
    )

  const beneficiairesEtAccompagnementsPromise = fetchBeneficiairesEtAccompagnements(codeDepartement)
  const dateGeneration = new Date()

  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { href: '/gouvernances', label: 'Gouvernances' },
          { href: `/gouvernance/${codeDepartement}`, label: nomDepartement(codeDepartement) },
          { label: 'Aidants et médiateurs' },
        ]}
      />
      <AidantsMediateurs
        accompagnementsEtMediateursPromise={accompagnementsEtMediateursPromise}
        beneficiairesEtAccompagnementsPromise={beneficiairesEtAccompagnementsPromise}
        dateGeneration={dateGeneration}
        niveauDeFormationPromise={niveauDeFormationPromise}
      />
    </>
  )
}

type Props = Readonly<{
  params: Promise<{ codeDepartement: string }>
}>
