import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import MenuLateral from '@/components/Action/MenuLateral'
import ModifierUneAction from '@/components/Action/ModifierUneAction'
import Notice from '@/components/shared/Notice/Notice'
import { Membre } from '@/domain/Membre'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { actionPresenter } from '@/presenters/actionPresenter'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { GetMembresDuGestionnaireRepository } from '@/use-cases/commands/shared/MembreRepository'
import { RecupererUneGouvernance } from '@/use-cases/queries/RecupererUneGouvernance'

export default async function ActionModifierController({ params }: Props): Promise<ReactElement> {
  try {
    const session = await getSession()

    if (!session) {
      redirect('/connexion')
    }
    const codeDepartement = (await params).codeDepartement
    const gouvernanceLoader = new PrismaGouvernanceLoader()
    const utilisateurLoader = new PrismaUtilisateurLoader()
    const utilisateur = await utilisateurLoader.findByUid(session.user.sub)
    const noopRepository = new class implements GetMembresDuGestionnaireRepository {
    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
      async get(): Promise<Array<Membre>> {
        return Promise.resolve([])
      }
    }()
    const gouvernanceReadModel = await new RecupererUneGouvernance(
      gouvernanceLoader,
      noopRepository
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
