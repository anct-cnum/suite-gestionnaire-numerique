import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import { Groupe, TypologieRole } from './domain/Role'
import { clientContext } from '@/components/shared/ClientContext'

export function matchWithoutMarkup(wording: string) {
  return function(_: string, element: Element | null): boolean {
    return element?.textContent === wording
  }
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
}

export const clientContextProviderDefaultValue = {
  router: spiedNextNavigation.useRouter,
  searchParams: new URLSearchParams(),
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
  clientContextProviderValue = clientContextProviderDefaultValue
): void {
  render(
    <clientContext.Provider value={clientContextProviderValue}>
      {children}
    </clientContext.Provider>
  )
}
