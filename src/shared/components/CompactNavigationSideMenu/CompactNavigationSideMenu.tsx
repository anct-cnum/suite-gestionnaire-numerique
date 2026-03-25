'use client'

import { CSSProperties, ReactElement } from 'react'

import { addActiveStateToItems, type SideMenuItem } from './navigationSideMenuUtils'
import useNavigationSideMenu from '../../hooks/useNavigationSideMenu'

export default function CompactNavigationSideMenu({
  burgerMenuButtonText = 'Sections',
  className = '',
  contentId,
  items,
  style,
}: CompactNavigationSideMenuProps): ReactElement {
  const { activeHref } = useNavigationSideMenu({ contentId, items })
  const processedItems = addActiveStateToItems(items, activeHref)

  const sideMenuId = 'fr-sidemenu-compact'

  return (
    <nav aria-labelledby={`${sideMenuId}-title`} className={`fr-sidemenu ${className}`} role="navigation" style={style}>
      <div className="fr-sidemenu__inner">
        <button
          aria-controls={`${sideMenuId}-wrapper`}
          aria-expanded="false"
          className="fr-sidemenu__btn"
          type="button"
        >
          {burgerMenuButtonText}
        </button>
        <div className="fr-collapse" id={`${sideMenuId}-wrapper`}>
          <ul className="fr-sidemenu__list">
            {processedItems.map((item, index) => getItemElement(item, `${sideMenuId}-${index}`, activeHref))}
          </ul>
        </div>
      </div>
    </nav>
  )
}

function getItemElement(
  item: Readonly<{ expandedByDefault?: boolean; isActive?: boolean }> & SideMenuItem,
  id: string,
  activeHref: string
): ReactElement {
  const isActive = 'linkProps' in item && item.linkProps?.href === activeHref

  if ('items' in item && item.items !== undefined && item.items.length > 0) {
    return (
      <li className="fr-sidemenu__item" key={id}>
        <a aria-current={isActive ? 'page' : undefined} className="fr-sidemenu__link" href={item.linkProps?.href}>
          {item.text}
        </a>
        <ul className="fr-sidemenu__list">
          {item.items.map((subItem, subIndex) =>
            getItemElement(subItem as Readonly<{ isActive?: boolean }> & SideMenuItem, `${id}-${subIndex}`, activeHref)
          )}
        </ul>
      </li>
    )
  }

  return (
    <li className="fr-sidemenu__item" key={id}>
      <a aria-current={isActive ? 'page' : undefined} className="fr-sidemenu__link" href={item.linkProps?.href}>
        {item.text}
      </a>
    </li>
  )
}

type CompactNavigationSideMenuProps = Readonly<{
  burgerMenuButtonText?: string
  className?: string
  contentId: string
  items: ReadonlyArray<SideMenuItem>
  style?: CSSProperties
}>

export type { SideMenuItem }
