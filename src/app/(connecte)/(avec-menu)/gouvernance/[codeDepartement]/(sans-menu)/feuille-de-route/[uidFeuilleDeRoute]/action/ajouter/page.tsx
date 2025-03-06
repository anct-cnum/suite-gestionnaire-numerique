import { notFound, redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import AjouterUneAction from '@/components/Action/AjouterUneAction'
import MenuLateral from '@/components/Action/MenuLateral'
import Notice from '@/components/shared/Notice/Notice'
import { Membre } from '@/domain/Membre'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { actionARemplir } from '@/presenters/actionPresenter'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { GetMembresDuGestionnaireRepository } from '@/use-cases/commands/shared/MembreRepository'
import { RecupererUneGouvernance } from '@/use-cases/queries/RecupererUneGouvernance'

export default async function ActionAjouterController({ params }: Props): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }
  const date = new Date()
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
  try {
    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w menu-border">
          <Notice />
          <AjouterUneAction
            action={actionARemplir}
            coporteurs={gouvernanceViewModel.sectionMembres.coporteurs}
            date={date}
          />
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}

type Props = PropsWithChildren<Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>>
