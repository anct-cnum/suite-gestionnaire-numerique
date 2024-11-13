'use client'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createContext, ReactElement, PropsWithChildren, useMemo } from 'react'

import { SessionUtilisateurViewModel } from '@/presenters/sessionUtilisateurPresenter'

export default function ClientContext({
  children,
  roles,
  sessionUtilisateurViewModel,
  utilisateursParPage,
}: ClientContextProps): ReactElement {
  const searchParams = useSearchParams()
  const pathname = usePathname() as __next_route_internal_types__.StaticRoutes
  const router = useRouter()

  const clientContextProviderValue = useMemo(
    () => ({
      pathname,
      roles,
      router,
      searchParams,
      sessionUtilisateurViewModel,
      utilisateursParPage,
    }),
    [pathname, roles, router, searchParams, sessionUtilisateurViewModel, utilisateursParPage]
  )

  return (
    <clientContext.Provider value={clientContextProviderValue}>
      {children}
    </clientContext.Provider>
  )
}

export const clientContext = createContext<ClientContextProviderValue>({} as ClientContextProviderValue)

export type ClientContextProviderValue = Readonly<{
  pathname: __next_route_internal_types__.StaticRoutes,
  roles: ReadonlyArray<string>
  router: AppRouterInstance
  searchParams: URLSearchParams
  sessionUtilisateurViewModel: SessionUtilisateurViewModel
  utilisateursParPage: number
}>

type ClientContextProps = PropsWithChildren<Readonly<{
  roles: ReadonlyArray<string>
  sessionUtilisateurViewModel: SessionUtilisateurViewModel
  utilisateursParPage: number
}>>
