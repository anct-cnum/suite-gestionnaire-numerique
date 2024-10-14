import { render } from '@testing-library/react'
import * as navigation from 'next/navigation'
import { ReactElement } from 'react'

import { Groupe, TypologieRole } from './domain/Role'
import { sessionUtilisateurContext } from '@/components/shared/SessionUtilisateurContext'

export function matchWithoutMarkup(wording: string) {
  return function(_: string, element: Element | null): boolean {
    return element?.textContent === wording
  }
}

export const infosSessionUtilisateurContext = {
  session: {
    email: 'martin.tartempion@example.net',
    nom: 'Tartempion',
    prenom: 'Martin',
    role: {
      groupe: 'admin' as Groupe,
      libelle: 'Mednum',
      nom: 'Support animation' as TypologieRole,
      pictogramme: 'support-animation',
    },
    uid: 'fooId',
  },
}

export function renderComponent(
  children: ReactElement,
  sessionUtilisateurContextProvider = infosSessionUtilisateurContext
): void {
  render(
    <sessionUtilisateurContext.Provider value={sessionUtilisateurContextProvider}>
      {children}
    </sessionUtilisateurContext.Provider>
  )
}

export const spiedNextNavigation = {
  useRouter: {
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  },
  useSearchParams: new URLSearchParams(),
}

export function spyOnSearchParams(
  nombreDeSpy: number,
  spiedURLSearchParams: URLSearchParams = spiedNextNavigation.useSearchParams
): void {
  // @ts-expect-error
  const spy = vi.spyOn(navigation, 'useSearchParams').mockReturnValueOnce(spiedURLSearchParams)

  for (let index = 0; index < nombreDeSpy - 1; index++) {
    // @ts-expect-error
    spy.mockReturnValueOnce(spiedURLSearchParams)
  }
}
