'use client'

import Link from 'next/link'
import { ReactElement, useState } from 'react'

export default function MenuLateral({ menu }: Props): ReactElement {
  const [selectedSection, setSelectedSection] = useState<string>(menu[0].url)

  return (
    <nav
      aria-labelledby="fr-sidemenu-title"
      className="fr-sidemenu fr-pt-5w fr-px-1w"
    >
      <div
        className="fr-hidden"
        id="fr-sidemenu-title"
      >
        Sommaire
      </div>
      <ul className="fr-sidemenu__list">
        {menu.map(({ libelle, url }) => (
          <li
            className="fr-sidemenu__item"
            key={url}
          >
            <Link
              aria-current={selectedSection === url ? 'page' : undefined}
              className="fr-sidemenu__link"
              href={url}
              onClick={() => {
                setSelectedSection(url)
              }}
            >
              {libelle}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

type Props = Readonly<{
  menu: ReadonlyArray<{
    libelle: string
    url: string
  }>
}>
