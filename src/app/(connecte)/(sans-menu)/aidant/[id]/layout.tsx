import { ReactElement, ReactNode } from 'react'

import MenuCollant, { MenuCollantSection } from '@/components/AidantDetails/MenuCollant'

export default function AidantLayout({ children }: Props): ReactElement {
  const sections: ReadonlyArray<MenuCollantSection> = [
    { id: 'informations-personnelles', label: 'Informations personnelles' },
    { id: 'structures-employeuses', label: 'Structures employeuses' },
    { id: 'activites', label: 'Activités' },
    { id: 'lieux-activite', label: 'Lieux d\'activité' },
  ]

  return (
    <div className="fr-container fr-py-4w">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-3">
          <MenuCollant sections={sections} />
        </div>
        <div className="fr-col-12 fr-col-md-9">
          {children}
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  children: ReactNode
}>
