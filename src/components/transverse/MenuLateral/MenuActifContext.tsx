'use client'

import { usePathname } from 'next/navigation'
import { createContext, PropsWithChildren, ReactElement, useContext } from 'react'

export const menuActifContext = createContext('/')

export function MenuActifProvider({ children }: Readonly<PropsWithChildren>): ReactElement {
  const pathname = usePathname()

  return <menuActifContext.Provider value={pathname}>{children}</menuActifContext.Provider>
}

export function useMenuActif(): string {
  return useContext(menuActifContext)
}
