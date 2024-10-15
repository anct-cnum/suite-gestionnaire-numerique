'use client'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter, useSearchParams } from 'next/navigation'
import { createContext, ReactElement, PropsWithChildren, useMemo } from 'react'

import { createSessionUtilisateurPresenter, SessionUtilisateurViewModel } from '@/presenters/sessionUtilisateurPresenter'
import config from '@/use-cases/config.json'
import { UnUtilisateurReadModel } from '@/use-cases/queries/RechercherUnUtilisateur'

export default function ClientContext({ children, utilisateurReadModel }: ClientContextProps): ReactElement {
  const session = createSessionUtilisateurPresenter(utilisateurReadModel)
  const searchParams = useSearchParams()
  const router = useRouter()
  const utilisateursParPage = config.utilisateursParPage

  const clientContextProviderValue = useMemo(
    () => ({ router, searchParams, session, utilisateursParPage }),
    [router, searchParams, session, utilisateursParPage]
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
  utilisateursParPage: number
}>

type ClientContextProps = PropsWithChildren<Readonly<{
  utilisateurReadModel: UnUtilisateurReadModel
}>>
