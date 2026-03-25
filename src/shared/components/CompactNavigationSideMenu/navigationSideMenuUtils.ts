export type SideMenuItem = Readonly<{
  items?: ReadonlyArray<SideMenuItem>
  linkProps?: Readonly<{
    href?: string
  }>
  text: string
}>

type ProcessedItem = Readonly<{ expandedByDefault?: boolean; isActive?: boolean }> & SideMenuItem

function isItemActive(activeHref: string, item: SideMenuItem): boolean {
  return 'linkProps' in item && item.linkProps?.href === activeHref
}

function addActiveStateToItems(
  items: ReadonlyArray<SideMenuItem>,
  activeHref?: null | string,
  isFirstRecursion = true
): ReadonlyArray<ProcessedItem> {
  return items.map((item, index) => {
    if ('items' in item && item.items !== undefined && item.items.length > 0) {
      return {
        expandedByDefault:
          activeHref !== null && activeHref !== undefined && activeHref !== ''
            ? item.items.some((subItem) => isItemActive(activeHref, subItem))
            : index === 0,
        ...item,
        items: addActiveStateToItems(item.items, activeHref, index === 0),
      }
    }

    return {
      ...item,
      isActive:
        activeHref !== null && activeHref !== undefined && activeHref !== ''
          ? isItemActive(activeHref, item)
          : index === 0 && isFirstRecursion,
    }
  })
}

export { addActiveStateToItems }
