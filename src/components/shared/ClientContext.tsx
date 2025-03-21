// Stryker disable all
/* eslint-disable import/no-restricted-paths */
'use client'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createContext, ReactElement, PropsWithChildren, useMemo } from 'react'

import { accepterUnMembreAction } from '@/app/api/actions/accepterUnMembreAction'
import { ajouterUnComiteAction } from '@/app/api/actions/ajouterUnComiteAction'
import { ajouterUneActionAction } from '@/app/api/actions/ajouterUneActionAction'
import { ajouterUneFeuilleDeRouteAction } from '@/app/api/actions/ajouterUneFeuilleDeRouteAction'
import { ajouterUneNoteDeContexteAction } from '@/app/api/actions/ajouterUneNoteDeContexteAction'
import { ajouterUneNoteDeContextualisationAction } from '@/app/api/actions/ajouterUneNoteDeContextualisationAction'
import { ajouterUneNotePriveeAction } from '@/app/api/actions/ajouterUneNotePriveeAction'
import { changerMonRoleAction } from '@/app/api/actions/changerMonRoleAction'
import { inviterUnUtilisateurAction } from '@/app/api/actions/inviterUnUtilisateurAction'
import { modifierMesInformationsPersonnellesAction } from '@/app/api/actions/modifierMesInformationsPersonnellesAction'
import { modifierUnComiteAction } from '@/app/api/actions/modifierUnComiteAction'
import { modifierUneActionAction } from '@/app/api/actions/modifierUneActionAction'
import { modifierUneFeuilleDeRouteAction } from '@/app/api/actions/modifierUneFeuilleDeRouteAction'
import { modifierUneNoteDeContexteAction } from '@/app/api/actions/modifierUneNoteDeContexteAction'
import { modifierUneNoteDeContextualisationAction } from '@/app/api/actions/modifierUneNoteDeContextualisationAction'
import { modifierUneNotePriveeAction } from '@/app/api/actions/modifierUneNotePriveeAction'
import { reinviterUnUtilisateurAction } from '@/app/api/actions/reinviterUnUtilisateurAction'
import { supprimerMonCompteAction } from '@/app/api/actions/supprimerMonCompteAction'
import { supprimerUnComiteAction } from '@/app/api/actions/supprimerUnComiteAction'
import { supprimerUneNoteDeContexteAction } from '@/app/api/actions/supprimerUneNoteDeContexteAction'
import { supprimerUneNoteDeContextualisationAction } from '@/app/api/actions/supprimerUneNoteDeContextualisationAction'
import { supprimerUneNotePriveeAction } from '@/app/api/actions/supprimerUneNotePriveeAction'
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
      accepterUnMembreAction,
      ajouterUnComiteAction,
      ajouterUneActionAction,
      ajouterUneFeuilleDeRouteAction,
      ajouterUneNoteDeContexteAction,
      ajouterUneNoteDeContextualisationAction,
      ajouterUneNotePriveeAction,
      changerMonRoleAction,
      inviterUnUtilisateurAction,
      modifierMesInformationsPersonnellesAction,
      modifierUnComiteAction,
      modifierUneActionAction,
      modifierUneFeuilleDeRouteAction,
      modifierUneNoteDeContexteAction,
      modifierUneNoteDeContextualisationAction,
      modifierUneNotePriveeAction,
      pathname,
      reinviterUnUtilisateurAction,
      roles,
      router,
      searchParams,
      sessionUtilisateurViewModel,
      supprimerMonCompteAction,
      supprimerUnComiteAction,
      supprimerUnUtilisateurAction,
      supprimerUneNoteDeContexteAction,
      supprimerUneNoteDeContextualisationAction,
      supprimerUneNotePriveeAction,
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
  accepterUnMembreAction: typeof accepterUnMembreAction
  changerMonRoleAction: typeof changerMonRoleAction
  inviterUnUtilisateurAction: typeof inviterUnUtilisateurAction
  modifierMesInformationsPersonnellesAction: typeof modifierMesInformationsPersonnellesAction
  pathname: string
  reinviterUnUtilisateurAction: typeof reinviterUnUtilisateurAction
  ajouterUnComiteAction: typeof ajouterUnComiteAction
  ajouterUneFeuilleDeRouteAction: typeof ajouterUneFeuilleDeRouteAction
  ajouterUneActionAction: typeof ajouterUneActionAction
  modifierUneActionAction: typeof modifierUneActionAction
  modifierUneNoteDeContextualisationAction: typeof modifierUneNoteDeContextualisationAction
  ajouterUneNoteDeContexteAction: typeof ajouterUneNoteDeContexteAction
  modifierUneNoteDeContexteAction: typeof modifierUneNoteDeContexteAction
  ajouterUneNotePriveeAction: typeof ajouterUneNotePriveeAction
  ajouterUneNoteDeContextualisationAction: typeof ajouterUneNoteDeContextualisationAction
  modifierUnComiteAction: typeof modifierUnComiteAction
  modifierUneFeuilleDeRouteAction: typeof modifierUneFeuilleDeRouteAction
  modifierUneNotePriveeAction: typeof modifierUneNotePriveeAction
  supprimerUneNoteDeContexteAction: typeof supprimerUneNoteDeContexteAction
  roles: ReadonlyArray<string>
  router: AppRouterInstance
  searchParams: URLSearchParams
  sessionUtilisateurViewModel: SessionUtilisateurViewModel
  supprimerMonCompteAction: typeof supprimerMonCompteAction
  supprimerUnComiteAction: typeof supprimerUnComiteAction
  supprimerUneNotePriveeAction: typeof supprimerUneNotePriveeAction
  supprimerUnUtilisateurAction: typeof supprimerUnUtilisateurAction
  supprimerUneNoteDeContextualisationAction: typeof supprimerUneNoteDeContextualisationAction
  utilisateursParPage: number
}>

type Props = PropsWithChildren<Readonly<{
  roles: ReadonlyArray<string>
  sessionUtilisateurViewModel: SessionUtilisateurViewModel
  utilisateursParPage: number
}>>
