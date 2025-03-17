import { notFound } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import AjouterUneAction from '@/components/Action/AjouterUneAction'
import MenuLateral from '@/components/Action/MenuLateral'
import Notice from '@/components/shared/Notice/Notice'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'
import { actionARemplir } from '@/presenters/actionPresenter'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { RecupererUneGouvernance } from '@/use-cases/queries/RecupererUneGouvernance'

export default async function ActionAjouterController({ params }: Props): Promise<ReactElement> {
  const date = new Date()
  const codeDepartement = (await params).codeDepartement
  const gouvernanceLoader = new PrismaGouvernanceLoader()
  const gouvernanceReadModel = await new RecupererUneGouvernance(gouvernanceLoader).handle({ codeDepartement })

  const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModel, new Date())
  try {
    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w">
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
