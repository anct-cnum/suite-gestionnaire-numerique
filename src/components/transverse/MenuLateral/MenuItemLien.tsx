'use client'

import Link from 'next/link'
import { PropsWithChildren, ReactElement } from 'react'

import { useMenuActif } from './MenuActifContext'
import styles from './MenuLateral.module.css'
import Icon from '@/components/shared/Icon/Icon'

export function MenuItemLien({
  ariaControls,
  ariaExpanded,
  children,
  customIcon,
  estAVenir,
  icon,
  label,
  url,
}: Props): ReactElement {
  const pathname = useMenuActif()
  const isActive = pathname === url
  const activeClass = isActive ? `fr-sidemenu__item--active ${styles['element-selectionne']}` : ''
  const isExpanded = ariaExpanded === undefined ? undefined : pathname === url || pathname.startsWith(`${url}/`)

  function renderIcone(): null | ReactElement {
    if (customIcon !== undefined) {
      return (
        <img
          alt=""
          className="fr-mr-1w"
          height={24}
          src={customIcon}
          width={24}
        />
      )
    }
    if (icon !== undefined) {
      return (
        <Icon
          classname="fr-mr-1w"
          icon={icon}
        />
      )
    }
    return null
  }

  const icone = renderIcone()

  return (
    <li className={`fr-sidemenu__item ${activeClass}`}>
      <Link
        aria-controls={ariaControls}
        aria-current={isActive ? 'page' : false}
        aria-expanded={isExpanded}
        className="fr-sidemenu__link"
        href={url}
      >
        {estAVenir === true ? (
          <span className="color-grey">
            {icone}
            {label}
          </span>
        ) : (
          <>
            {icone}
            {label}
          </>
        )}
      </Link>
      {children}
    </li>
  )
}

type Props = PropsWithChildren<Readonly<{
  ariaControls?: string
  ariaExpanded?: boolean
  customIcon?: string
  estAVenir?: boolean
  icon?: string
  label: string
  url: string
}>>
