'use client'

import { createContext, Dispatch, SetStateAction, ReactElement, useMemo, useState, PropsWithChildren } from 'react'

import { SessionUtilisateurViewModel, sessionUtilisateurNonAuthentifie } from '@/components/shared/SelecteurRole/session-utilisateur-presenter'

export default function SessionUtilisateurContext({ children }: PropsWithChildren): ReactElement {
  const [session, setSession] = useState<SessionUtilisateurViewModel>(sessionUtilisateurNonAuthentifie)
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

const initialInfosSessionUtilisateurContext = {
  session: sessionUtilisateurNonAuthentifie,
  setSession: () => {
    return
  },
}

export const sessionUtilisateurContext =
  createContext<InfosSessionUtilisateurContext>(initialInfosSessionUtilisateurContext)

export type InfosSessionUtilisateurContext = Readonly<{
  session: SessionUtilisateurViewModel,
  setSession: Dispatch<SetStateAction<SessionUtilisateurViewModel>>
}>
