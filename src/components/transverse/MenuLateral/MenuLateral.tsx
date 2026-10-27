import { Fragment, ReactElement } from 'react'

import { MenuItemLien } from './MenuItemLien'
import styles from './MenuLateral.module.css'
import { sectionsParContexte } from './registreMenus'
import { Contexte } from '@/use-cases/queries/ResoudreContexte'

export default function MenuLateral({ contexte }: Props): ReactElement {
  const sections = sectionsParContexte(contexte)

  return (
    <nav aria-labelledby="fr-sidemenu-title" className={`fr-sidemenu fr-pt-5w ${styles.menu}`}>
      <div className="fr-sidemenu__title fr-hidden" id="fr-sidemenu-title">
        Menu inclusion numérique
      </div>
      {sections.map((section) => (
        <Fragment key={section.titre}>
          {section.titre !== '' && (
            <p className="fr-text--sm color-grey separator fr-mt-2w fr-mb-1w">{section.titre}</p>
          )}
          <ul className="fr-sidemenu__list">
            {section.menus
              .filter((menu) => menu.visible === undefined || menu.visible(contexte))
              .map((menu) => (
                <MenuItemLien
                  ariaControls={menu.ariaControls}
                  ariaExpanded={menu.sousMenus === undefined ? undefined : false}
                  customIcon={menu.customIcon}
                  icon={menu.icon}
                  key={menu.label}
                  label={menu.label}
                  url={menu.url(contexte)}
                >
                  {menu.sousMenus !== undefined && (
                    <div className="fr-collapse" id={menu.ariaControls}>
                      <ul className="fr-sidemenu__list">
                        {menu.sousMenus.map((sousMenu) => (
                          <MenuItemLien key={sousMenu.label} label={sousMenu.label} url={sousMenu.url(contexte)} />
                        ))}
                      </ul>
                    </div>
                  )}
                </MenuItemLien>
              ))}
          </ul>
        </Fragment>
      ))}
    </nav>
  )
}

type Props = Readonly<{
  contexte: Contexte
}>
