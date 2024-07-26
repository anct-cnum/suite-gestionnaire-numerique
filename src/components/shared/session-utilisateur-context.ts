import { createContext, Dispatch, SetStateAction } from 'react'

import { SessionUtilisateurViewModel, sessionUtilisateurNonAuthentifie } from '@/components/shared/SelecteurRole/session-utilisateur-presenter'

const initialInfosSessionUtilisateurContext = {
  session: sessionUtilisateurNonAuthentifie,
  setSession: () => {
    return
  },
}

export const sessionUtilisateurContext =
  createContext<InfosSessionUtilisateurContext>(initialInfosSessionUtilisateurContext)

type InfosSessionUtilisateurContext = Readonly<{
  session: SessionUtilisateurViewModel,
  setSession: Dispatch<SetStateAction<SessionUtilisateurViewModel>>
}>
