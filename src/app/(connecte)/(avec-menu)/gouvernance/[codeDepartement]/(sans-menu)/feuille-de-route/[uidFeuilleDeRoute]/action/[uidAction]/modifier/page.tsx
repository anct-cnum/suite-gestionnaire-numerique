import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import MenuLateral from '@/components/Action/MenuLateral'
import ModifierUneAction from '@/components/Action/ModifierUneAction'
import Notice from '@/components/shared/Notice/Notice'
import { actionPresenter } from '@/presenters/actionPresenter'

export default async function ActionModifierController({ params }: Props): Promise<ReactElement> {
  try {
    const codeDepartement = (await params).codeDepartement
    const actionViewModel = actionPresenter(codeDepartement)

    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w">
          <Notice />
          <ModifierUneAction
            action={actionViewModel}
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
