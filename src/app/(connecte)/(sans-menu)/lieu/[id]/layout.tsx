import { ReactElement, ReactNode } from 'react'

import MenuCollant, { MenuCollantSection } from '@/components/AidantDetails/MenuCollant'

export default function AidantLayout({ children }: Props): ReactElement {
  const sections: ReadonlyArray<MenuCollantSection> = [
    {
      id: 'informations-generales',
      label: 'Informations générales',

    },
    {
      id: 'lieu-accueil-public',
      label: 'Lieu accueillant du public',
      sousMenus: [
        { id: 'lieu-detail-description', label: 'Description de l\'activité du lieu' },
        { id: 'lieu-information-pratique', label: 'Informations pratiques' }],
    },
    {
      id: 'services-inclusion-numerique',
      label: 'Services d\'inclusion numérique',
      sousMenus: [
        { id: 'lieu-detail-service-accompagnement', label: 'Services & types d\'accompagnement' },
        { id: 'lieu-detail-service-modalite', label: 'Modalités d\'accès au service' },
        { id: 'lieu-detail-service-public', label: 'Types de publics accueillis' },
      ],
    },
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
