// Stryker disable all
/* eslint-disable import/no-restricted-paths */
'use client'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createContext, ReactElement, PropsWithChildren, useMemo } from 'react'

import { ajouterUnComiteAction } from '@/app/api/actions/ajouterUnComiteAction'
import { changerMonRoleAction } from '@/app/api/actions/changerMonRoleAction'
import { inviterUnUtilisateurAction } from '@/app/api/actions/inviterUnUtilisateurAction'
import { modifierMesInformationsPersonnellesAction } from '@/app/api/actions/modifierMesInformationsPersonnellesAction'
import { reinviterUnUtilisateurAction } from '@/app/api/actions/reinviterUnUtilisateurAction'
import { supprimerMonCompteAction } from '@/app/api/actions/supprimerMonCompteAction'
import { supprimerUnUtilisateurAction } from '@/app/api/actions/supprimerUnUtilisateurAction'
import { SessionUtilisateurViewModel } from '@/presenters/sessionUtilisateurPresenter'

export default function ClientContext({
  children,
  roles,
  sessionUtilisateurViewModel,
  utilisateursParPage,
}: Props): ReactElement {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const clientContextProviderValue = useMemo(
    () => ({
      ajouterUnComiteAction,
      changerMonRoleAction,
      inviterUnUtilisateurAction,
      modifierMesInformationsPersonnellesAction,
      pathname,
      reinviterUnUtilisateurAction,
      roles,
      router,
      searchParams,
      sessionUtilisateurViewModel,
      supprimerMonCompteAction,
      supprimerUnUtilisateurAction,
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
  changerMonRoleAction: typeof changerMonRoleAction
  inviterUnUtilisateurAction: typeof inviterUnUtilisateurAction,
  modifierMesInformationsPersonnellesAction: typeof modifierMesInformationsPersonnellesAction
  pathname: string
  reinviterUnUtilisateurAction: typeof reinviterUnUtilisateurAction,
  ajouterUnComiteAction: typeof ajouterUnComiteAction
  roles: ReadonlyArray<string>
  router: AppRouterInstance
  searchParams: URLSearchParams
  sessionUtilisateurViewModel: SessionUtilisateurViewModel
  supprimerMonCompteAction: typeof supprimerMonCompteAction
  supprimerUnUtilisateurAction: typeof supprimerUnUtilisateurAction
  utilisateursParPage: number
}>

type Props = PropsWithChildren<Readonly<{
  roles: ReadonlyArray<string>
  sessionUtilisateurViewModel: SessionUtilisateurViewModel
  utilisateursParPage: number
}>>
