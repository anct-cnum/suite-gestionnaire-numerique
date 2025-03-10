import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import MenuLateral from '@/components/Action/MenuLateral'
import ModifierUneAction from '@/components/Action/ModifierUneAction'
import Notice from '@/components/shared/Notice/Notice'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'
import { PrismaMembreRepository } from '@/gateways/PrismaMembreRepository'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { actionPresenter } from '@/presenters/actionPresenter'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { RecupererUneGouvernance } from '@/use-cases/queries/RecupererUneGouvernance'

export default async function ActionModifierController({ params }: Props): Promise<ReactElement> {
  try {
    const session = await getSession()

    if (!session) {
      redirect('/connexion')
    }
    const codeDepartement = (await params).codeDepartement
    const utilisateurLoader = new PrismaUtilisateurLoader()
    const utilisateur = await utilisateurLoader.findByUid(session.user.sub)
    const gouvernanceReadModel = await new RecupererUneGouvernance(
      new PrismaGouvernanceLoader(),
      new PrismaMembreRepository()
    ).handle({
      codeDepartement,
      uidUtilisateurCourant: utilisateur.uid,
    })

    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModel, new Date())
    const actionViewModel = actionPresenter(codeDepartement)

    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w menu-border">
          <Notice />
          <ModifierUneAction
            action={actionViewModel}
            coporteurs={gouvernanceViewModel.sectionMembres.coporteurs}
          />
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
