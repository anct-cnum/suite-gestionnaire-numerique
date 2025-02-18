import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import { FormulaireAction } from '@/components/Actions/FormulaireAction'
import MenuLateral from '@/components/Actions/MenuLateral'

export default function AjouterActionController(): ReactElement {
  const date = new Date()
  try {
    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w menu-border">
          <FormulaireAction date={date} />
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}
