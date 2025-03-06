import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import MenuLateral from '@/components/Action/MenuLateral'
import ModifierUneAction from '@/components/Action/ModifierUneAction'
import Notice from '@/components/shared/Notice/Notice'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'
import { actionPresenter } from '@/presenters/actionPresenter'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { RecupererUneGouvernance } from '@/use-cases/queries/RecupererUneGouvernance'

export default async function ActionModifierController({ params }: Props): Promise<ReactElement> {
  try {
    const codeDepartement = (await params).codeDepartement
    const gouvernanceLoader = new PrismaGouvernanceLoader()
    const gouvernanceReadModel = await new RecupererUneGouvernance(gouvernanceLoader).handle({ codeDepartement })

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
