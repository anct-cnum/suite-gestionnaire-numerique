import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import AjouterUnMembrePage from '@/components/GestionMembresGouvernance/AjouterUnMembrePage'
import { handleReadModelOrError, isErrorReadModel } from '@/components/shared/ErrorHandler'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaRejoindreUneGouvernanceLoader } from '@/gateways/PrismaRejoindreUneGouvernanceLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { rejoindreUneGouvernancePresenter } from '@/presenters/rejoindreUneGouvernancePresenter'

export const metadata: Metadata = {
  title: 'Rejoindre une gouvernance',
}

export default async function RejoindreUneGouvernanceController(): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)
  if (utilisateur.structureId === null) {
    notFound()
  }

  const readModel = await new PrismaRejoindreUneGouvernanceLoader().get(utilisateur.structureId)
  const viewModel = handleReadModelOrError(readModel, rejoindreUneGouvernancePresenter)
  if (isErrorReadModel(viewModel)) {
    notFound()
  }

  return (
    <>
      <FilAriane
        items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Rejoindre une gouvernance' }]}
      />
      <AjouterUnMembrePage
        candidature={{
          departements: viewModel.departements,
          entreprise: viewModel.entreprise,
        }}
      />
    </>
  )
}
