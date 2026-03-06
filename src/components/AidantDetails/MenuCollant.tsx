'use client'

import { ReactElement } from 'react'

import styles from './MenuCollant.module.css'
import CompactNavigationSideMenu, { type SideMenuItem } from '@/shared/components/CompactNavigationSideMenu'
import useStickyPosition from '@/shared/hooks/useStickyPosition'

export default function MenuCollant({ contentId, items }: Props): ReactElement {
  const { maxHeight, topPosition } = useStickyPosition({ enabled: true })

  return (
    <CompactNavigationSideMenu
      className={styles.menuFixed}
      contentId={contentId}
      items={items}
      style={{ maxHeight, top: topPosition }}
    />
  )
}

type Props = Readonly<{
  contentId: string
  items: ReadonlyArray<SideMenuItem>
}>

export type { SideMenuItem }
