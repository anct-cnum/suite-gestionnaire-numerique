'use client'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter, useSearchParams } from 'next/navigation'
import { createContext, ReactElement, PropsWithChildren, useMemo, useState } from 'react'

import { SessionUtilisateurViewModel } from '@/presenters/sessionUtilisateurPresenter'

export default function ClientContext({
  children,
  roles,
  sessionUtilisateurViewModel,
  utilisateursParPage,
}: ClientContextProps): ReactElement {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [bandeauInformations, setBandeauInformations] = useState<BandeauInformations>({})

  const clientContextProviderValue = useMemo(
    () => ({
      bandeauInformations,
      roles,
      router,
      searchParams,
      sessionUtilisateurViewModel,
      setBandeauInformations,
      utilisateursParPage,
    }),
    [roles, router, searchParams, sessionUtilisateurViewModel, utilisateursParPage, bandeauInformations]
  )

  return (
    <clientContext.Provider value={clientContextProviderValue}>
      {children}
    </clientContext.Provider>
  )
}

export const clientContext = createContext<ClientContextProviderValue>({} as ClientContextProviderValue)

export type BandeauInformations = Readonly<Partial<{
  titre: string
  description: string
}>>

export type ClientContextProviderValue = Readonly<{
  roles: ReadonlyArray<string>
  router: AppRouterInstance
  searchParams: URLSearchParams
  sessionUtilisateurViewModel: SessionUtilisateurViewModel
  utilisateursParPage: number
  bandeauInformations: BandeauInformations
  setBandeauInformations: (bandeauInformations: BandeauInformations) => void
}>

type ClientContextProps = PropsWithChildren<Readonly<{
  roles: ReadonlyArray<string>
  sessionUtilisateurViewModel: SessionUtilisateurViewModel
  utilisateursParPage: number
}>>
