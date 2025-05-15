'use client'

import { ReactElement, useState } from 'react'

export default function MenuLateral(): ReactElement {
  const [selectedSection, setSelectedSection] = useState('besoinsAction')

  return (
    <nav
      aria-labelledby="fr-sidemenu-title"
      className="fr-sidemenu fr-pt-5w fr-px-1w"
    >
      <div
        className="fr-sidemenu__title fr-hidden"
        id="fr-sidemenu-title"
      >
        Menu
      </div>
      <ul className="fr-sidemenu__list">
        {menuItems.map(({ id, titre }) => (
          <li
            className="fr-sidemenu__item"
            key={id}
          >
            <a
              aria-current={selectedSection === id ? 'page' : undefined}
              className="fr-sidemenu__link"
              href={`#${id}`}
              onClick={() => {
                setSelectedSection(id)
              }}
            >
              {titre}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

const menuItems = [
  {
    id: 'besoinsAction',
    titre: 'Besoins liés à l‘action',
  },
  {
    id: 'informationsAction',
    titre: 'Informations sur l‘action',
  },
  {
    id: 'porteurAction',
    titre: 'Porteur de l‘action',
  },
  {
    id: 'temporaliteAction',
    titre: 'Temporalité de l‘action',
  },
  {
    id: 'budgetAction',
    titre: 'Information sur le budget et le financement',
  },
  {
    id: 'destinatairesSubvention',
    titre: 'Destinataire(s) de la subvention',
  },
] as const
