'use client'

import { createContext, Dispatch, SetStateAction, ReactElement, useMemo, useState, PropsWithChildren } from 'react'

import { UtilisateurState } from '@/domain/Utilisateur'
import { createSessionUtilisateurPresenter, SessionUtilisateurViewModel } from '@/presenters/sessionUtilisateurPresenter'

export default function SessionUtilisateurContext(
  { children, utilisateurState }: SessionUtilisateurContextProps
): ReactElement {
  const [session, setSession] = useState<SessionUtilisateurViewModel>(
    createSessionUtilisateurPresenter(utilisateurState)
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
  utilisateurState: UtilisateurState
}>>
