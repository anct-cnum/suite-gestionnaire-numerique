'use client'

import { createContext, ReactElement, PropsWithChildren, useMemo } from 'react'

import { createSessionUtilisateurPresenter, SessionUtilisateurViewModel } from '@/presenters/sessionUtilisateurPresenter'
import { UtilisateurReadModel } from '@/use-cases/queries/UtilisateurQuery'

export default function SessionUtilisateurContext(
  { children, utilisateurReadModel }: SessionUtilisateurContextProps
): ReactElement {
  const session = createSessionUtilisateurPresenter(utilisateurReadModel)

  const sessionUtilisateurContextProvider = useMemo(
    () => ({ session }),
    [session]
  )

  return (
    <sessionUtilisateurContext.Provider value={sessionUtilisateurContextProvider}>
      {children}
    </sessionUtilisateurContext.Provider>
  )
}

export const sessionUtilisateurContext =
  createContext<InfosSessionUtilisateurContext>({} as InfosSessionUtilisateurContext)

type InfosSessionUtilisateurContext = Readonly<{
  session: SessionUtilisateurViewModel
}>

type SessionUtilisateurContextProps = PropsWithChildren<Readonly<{
  utilisateurReadModel: UtilisateurReadModel
}>>
