'use client'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter, useSearchParams } from 'next/navigation'
import { createContext, ReactElement, PropsWithChildren, useMemo } from 'react'

import { createSessionUtilisateurPresenter, SessionUtilisateurViewModel } from '@/presenters/sessionUtilisateurPresenter'
import { UnUtilisateurReadModel } from '@/use-cases/queries/RechercherUnUtilisateur'

export default function ClientContext({ children, utilisateurReadModel }: ClientContextProps): ReactElement {
  const session = createSessionUtilisateurPresenter(utilisateurReadModel)
  const searchParams = useSearchParams()
  const router = useRouter()

  const clientContextProviderValue = useMemo(
    () => ({ router, searchParams, session }),
    [router, searchParams, session]
  )

  return (
    <clientContext.Provider value={clientContextProviderValue}>
      {children}
    </clientContext.Provider>
  )
}

export const clientContext = createContext<ClientContextProviderValue>({} as ClientContextProviderValue)

type ClientContextProviderValue = Readonly<{
  router: AppRouterInstance
  searchParams: URLSearchParams
  session: SessionUtilisateurViewModel
}>

type ClientContextProps = PropsWithChildren<Readonly<{
  utilisateurReadModel: UnUtilisateurReadModel
}>>
