'use client'

import { createContext, Dispatch, SetStateAction, ReactElement, useMemo, useState, PropsWithChildren } from 'react'

import { createSessionUtilisateurPresenter, SessionUtilisateurViewModel } from '@/presenters/sessionUtilisateurPresenter'
import { UtilisateurReadModel } from '@/use-cases/queries/UtilisateurQuery'

export default function SessionUtilisateurContext(
  { children, utilisateurReadModel }: SessionUtilisateurContextProps
): ReactElement {
  const [session, setSession] = useState<SessionUtilisateurViewModel>(
    createSessionUtilisateurPresenter(utilisateurReadModel)
  )
  const sessionUtilisateurContextProvider = useMemo(
    () => ({ session, setSession }),
    [session, setSession]
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
  session: SessionUtilisateurViewModel,
  setSession: Dispatch<SetStateAction<SessionUtilisateurViewModel>>
}>

type SessionUtilisateurContextProps = PropsWithChildren<Readonly<{
  utilisateurReadModel: UtilisateurReadModel
}>>
