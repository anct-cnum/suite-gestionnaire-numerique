'use client'

import { useEffect, useMemo, useState } from 'react'

import type { SideMenuItem } from '@/shared/components/CompactNavigationSideMenu/navigationSideMenuUtils'

export default function useNavigationSideMenu({
  contentId,
  intersectionThreshold = 0.1,
  items,
}: Readonly<{
  contentId: string
  intersectionThreshold?: number
  items: ReadonlyArray<SideMenuItem>
}>): Readonly<{ activeHref: string; activeId: null | string }> {
  const [contentElement, setContentElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setContentElement(document.getElementById(contentId))
  }, [contentId])

  const navigableItemIds = useMemo(() => items.flatMap(getIdsFromItem).filter(Boolean), [items])

  const navigableItemsMemoKey = useMemo(() => navigableItemIds.join('-'), [navigableItemIds])

  const [activeId, setActiveId] = useState<null | string>(navigableItemIds[0] ?? null)

  useEffect(() => {
    // contentElement is used to trigger re-observation when the DOM element becomes available
    if (contentElement === null) {
      return undefined
    }

    const elements = navigableItemIds
      .map((id) => {
        if (id === '') {
          return document.body
        }
        return document.getElementById(id)
      })
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) {
      return undefined
    }

    const visibleElements = new Map(navigableItemIds.map((id) => [id, false]))

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entryChange of entries) {
          visibleElements.set(entryChange.target.id, entryChange.isIntersecting)
        }

        for (const [id, isVisible] of visibleElements.entries()) {
          if (isVisible) {
            setActiveId(id)
            break
          }
        }
      },
      {
        threshold: intersectionThreshold,
      }
    )

    for (const element of elements) {
      observer.observe(element)
    }

    return (): void => {
      observer.disconnect()
    }
  }, [contentElement, navigableItemsMemoKey, intersectionThreshold, navigableItemIds])

  return { activeHref: `#${activeId}`, activeId }
}

function getIdFromItem(item: SideMenuItem): null | string {
  if ('linkProps' in item) {
    return item.linkProps?.href?.toString().slice(1) ?? null
  }
  return null
}

function getIdsFromItem(item: SideMenuItem): ReadonlyArray<string> {
  const rootId = getIdFromItem(item)

  if ('items' in item && item.items !== undefined) {
    return rootId === null ? item.items.flatMap(getIdsFromItem) : [rootId, ...item.items.flatMap(getIdsFromItem)]
  }

  return rootId === null ? [] : [rootId]
}
